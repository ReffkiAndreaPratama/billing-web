import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingGateway } from '../billing/billing.gateway';

@Injectable()
export class SmartRulesService {
  constructor(
    private prisma: PrismaService,
    private gateway: BillingGateway,
  ) {}

  async checkIdleSessions() {
    const activeSessions = await this.prisma.billingSession.findMany({
      where: { status: 'ACTIVE' },
      include: { unit: true, member: true },
    });

    const results: any[] = [];
    for (const session of activeSessions) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: session.unit.branchId || '' },
        include: { settings: true },
      });

      const idleTimeout = branch?.settings?.idleTimeout || 30;
      const elapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 60000);
      const remaining = session.duration - elapsed;

      // Auto stop when time runs out
      if (remaining <= 0) {
        const ended = await this.prisma.billingSession.update({
          where: { id: session.id },
          data: {
            status: 'COMPLETED',
            endTime: new Date(),
            actualMinutes: elapsed,
            endedBy: 'SYSTEM',
          },
        });

        await this.prisma.unit.update({
          where: { id: session.unitId },
          data: { status: 'AVAILABLE' },
        });

        this.gateway.emitUnitUpdate(session.unitId, 'AVAILABLE', ended);
        this.gateway.emitBillingEnded(session.id);

        results.push({ sessionId: session.id, action: 'AUTO_STOPPED', reason: 'Time expired' });
      }

      // Warning notification for < 10 minutes
      if (remaining <= 10 && remaining > 0 && !session.notes?.includes('warning_sent')) {
        await this.prisma.billingSession.update({
          where: { id: session.id },
          data: { notes: 'warning_sent' },
        });

        this.gateway.emitNotification(`Session ${session.unit?.name}: ${remaining} minutes remaining`, 'WARNING');
        results.push({ sessionId: session.id, action: 'WARNING', remaining });
      }
    }

    return results;
  }

  async autoExtend(sessionId: string) {
    const session = await this.prisma.billingSession.findUnique({
      where: { id: sessionId },
      include: { member: true },
    });

    if (!session || session.status !== 'ACTIVE') return null;
    if (!session.member || session.member.balance <= 0) return null;

    const extendMinutes = 30;
    const costPerMinute = session.totalCost / session.duration;
    const extendCost = costPerMinute * extendMinutes;

    if (session.member.balance >= extendCost) {
      await this.prisma.billingSession.update({
        where: { id: sessionId },
        data: { duration: session.duration + extendMinutes, totalCost: session.totalCost + extendCost },
      });

      await this.prisma.member.update({
        where: { id: session.member.id },
        data: { balance: { decrement: extendCost } },
      });

      this.gateway.emitTimerUpdate(sessionId, session.duration + extendMinutes, session.totalCost + extendCost);
      return { extended: true, extendMinutes, cost: extendCost, remainingBalance: session.member.balance - extendCost };
    }

    return { extended: false, reason: 'Insufficient balance' };
  }
}
