import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShiftService {
  constructor(private prisma: PrismaService) {}

  async openShift(userId: string, branchId: string, initialCash: number) {
    const existing = await this.prisma.shift.findFirst({
      where: { userId, status: 'OPEN' },
    });
    if (existing) throw new BadRequestException('You already have an open shift');

    const count = await this.prisma.shift.count();
    return this.prisma.shift.create({
      data: {
        code: `SFT-${String(count + 1).padStart(4, '0')}`,
        userId,
        branchId,
        initialCash,
        status: 'OPEN',
      },
    });
  }

  async closeShift(id: string, actualCash: number, notes?: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: { transactions: true },
    });
    if (!shift) throw new NotFoundException('Shift not found');
    if (shift.status === 'CLOSED') throw new BadRequestException('Shift already closed');

    const totalTransactions = shift.transactions
      .filter(t => t.paymentStatus === 'PAID')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expectedCash = shift.initialCash + totalTransactions;
    const difference = actualCash - expectedCash;

    return this.prisma.shift.update({
      where: { id },
      data: {
        status: 'CLOSED',
        endTime: new Date(),
        expectedCash,
        actualCash,
        difference,
        notes,
      },
    });
  }

  async getShifts(query: { branchId?: string; page?: number; limit?: number }) {
    const { branchId, page = 1, limit = 20 } = query;
    const where: any = {};
    if (branchId) where.branchId = branchId;

    const [data, total] = await Promise.all([
      this.prisma.shift.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, username: true } } },
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.shift.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
