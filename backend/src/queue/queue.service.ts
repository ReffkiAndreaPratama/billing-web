import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async addToQueue(data: { customerName: string; customerPhone?: string; requestedUnitType?: string; notes?: string; branchId: string }) {
    return this.prisma.waitingQueue.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        requestedUnitType: data.requestedUnitType,
        notes: data.notes,
        branchId: data.branchId,
        position: 0,
        status: 'WAITING',
      },
    });
  }

  async getQueue(branchId: string) {
    const queue = await this.prisma.waitingQueue.findMany({
      where: { branchId, status: 'WAITING' },
      orderBy: { createdAt: 'asc' },
    });
    return queue.map((q, i) => ({ ...q, position: i + 1 }));
  }

  async serveCustomer(id: string) {
    return this.prisma.waitingQueue.update({
      where: { id },
      data: { status: 'SERVED', servedAt: new Date() },
    });
  }

  async cancelQueue(id: string) {
    return this.prisma.waitingQueue.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async estimateWaitTime(branchId: string, unitType?: string) {
    const where: any = { branchId, status: 'IN_USE' };
    if (unitType) where.type = unitType;
    const activeSessions = await this.prisma.billingSession.count({
      where: { unit: where, status: 'ACTIVE' },
    });
    const avgSessionMinutes = 60;
    const estimatedMinutes = activeSessions > 0 ? avgSessionMinutes : 5;
    return { estimatedMinutes, activeSessions, avgSessionMinutes };
  }
}
