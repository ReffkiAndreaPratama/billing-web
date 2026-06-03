import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingGateway } from './billing.gateway';
import { StartBillingDto } from './billing.dto';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private gateway: BillingGateway,
  ) {}

  async startSession(dto: StartBillingDto, userId: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id: dto.unitId } });
    if (!unit) throw new NotFoundException('Unit not found');
    if (unit.status !== 'AVAILABLE') throw new BadRequestException('Unit is not available');

    const duration = dto.duration;
    const totalCost = dto.packageId
      ? await this.calculatePackagePrice(dto.packageId)
      : unit.hourlyRate * (duration / 60) * (dto.isVip && unit.vipRate ? unit.vipRate / unit.hourlyRate : 1);

    const session = await this.prisma.billingSession.create({
      data: {
        startTime: new Date(),
        duration,
        totalCost,
        unitId: dto.unitId,
        memberId: dto.memberId,
        packageId: dto.packageId,
        startedBy: userId,
        status: 'ACTIVE',
      },
      include: { unit: true, member: true, package: true },
    });

    await this.prisma.unit.update({
      where: { id: dto.unitId },
      data: { status: 'IN_USE' },
    });

    if (dto.memberId) {
      await this.prisma.member.update({
        where: { id: dto.memberId },
        data: { visitCount: { increment: 1 }, lastVisit: new Date() },
      });
    }

    this.gateway.emitUnitUpdate(dto.unitId, 'IN_USE', session);
    this.gateway.emitBillingStarted(session);

    if (dto.paymentMethod) {
      await this.createTransaction(session.id, totalCost, dto.paymentMethod, userId, dto.memberId, unit.branchId);
    }

    return session;
  }

  async endSession(id: string, userId: string) {
    const session = await this.prisma.billingSession.findUnique({
      where: { id },
      include: { unit: true, pauses: true, transaction: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'COMPLETED') throw new BadRequestException('Session already ended');

    const totalPauseMinutes = session.pauses
      .filter(p => p.pauseEnd)
      .reduce((sum, p) => sum + (p.duration || 0), 0);

    const now = new Date();
    const elapsedMs = now.getTime() - session.startTime.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000) - totalPauseMinutes;
    const overtimeMinutes = Math.max(0, elapsedMinutes - session.duration);
    const overtimeCost = overtimeMinutes * (session.totalCost / session.duration) * 1.5;

    const ended = await this.prisma.billingSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endTime: now,
        actualMinutes: elapsedMinutes,
        overtimeCost,
        totalCost: session.totalCost + overtimeCost,
        endedBy: userId,
      },
      include: { unit: true, member: true },
    });

    await this.prisma.unit.update({
      where: { id: session.unitId },
      data: { status: 'AVAILABLE' },
    });

    this.gateway.emitUnitUpdate(session.unitId, 'AVAILABLE', ended);
    this.gateway.emitBillingEnded(id);

    const hasPayment = !!session.transaction;
    return {
      ...ended,
      paymentRequired: !hasPayment,
      amount: ended.totalCost,
    };
  }

  async pauseSession(id: string, reason?: string) {
    const session = await this.prisma.billingSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'ACTIVE') throw new BadRequestException('Session is not active');

    await this.prisma.sessionPause.create({
      data: { billingId: id, pauseStart: new Date(), reason },
    });

    const paused = await this.prisma.billingSession.update({
      where: { id },
      data: { status: 'PAUSED' },
      include: { unit: true, member: true, pauses: true },
    });

    this.gateway.emitBillingPaused(paused);
    return paused;
  }

  async resumeSession(id: string) {
    const pause = await this.prisma.sessionPause.findFirst({
      where: { billingId: id, pauseEnd: null },
    });
    if (!pause) throw new BadRequestException('No active pause found');

    const now = new Date();
    const duration = Math.floor((now.getTime() - pause.pauseStart.getTime()) / 60000);

    await this.prisma.sessionPause.update({
      where: { id: pause.id },
      data: { pauseEnd: now, duration },
    });

    const resumed = await this.prisma.billingSession.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: { unit: true, member: true, pauses: true },
    });

    this.gateway.emitBillingResumed(resumed);
    return resumed;
  }

  async getActiveSessions(branchId?: string) {
    const where: any = { status: { in: ['ACTIVE', 'PAUSED', 'OVERTIME'] } };
    if (branchId) where.unit = { branchId };

    return this.prisma.billingSession.findMany({
      where,
      include: { unit: true, member: true, package: true, pauses: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async getSessionHistory(query: { branchId?: string; page?: number; limit?: number }) {
    const { branchId, page = 1, limit = 20 } = query;
    const where: any = {};
    if (branchId) where.unit = { branchId };

    const [data, total] = await Promise.all([
      this.prisma.billingSession.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { unit: true, member: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.billingSession.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private async calculatePackagePrice(packageId: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg.price;
  }

  private async createTransaction(
    billingId: string,
    amount: number,
    paymentMethod: string,
    userId: string,
    memberId?: string,
    branchId?: string,
  ) {
    return this.prisma.transaction.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        type: 'BILLING',
        amount,
        paymentMethod: paymentMethod as any,
        paymentStatus: 'PAID',
        billingId,
        memberId,
        userId,
        branchId,
      },
    });
  }
}
