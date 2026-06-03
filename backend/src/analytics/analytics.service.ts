import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(branchId?: string) {
    const where = branchId ? { unit: { branchId } } : {};

    const [
      activeSessions,
      todayTransactions,
      totalMembers,
      totalUnits,
      usedUnits,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.billingSession.count({ where: { ...where, status: { in: ['ACTIVE', 'PAUSED'] } } }),
      this.getTodayRevenue(branchId),
      this.prisma.member.count(branchId ? { where: { branchId } } : {} as any),
      this.prisma.unit.count(branchId ? { where: { branchId, isActive: true } } : { where: { isActive: true } } as any),
      this.prisma.unit.count({ where: { ...(branchId ? { branchId } : {}), status: 'IN_USE' } as any }),
      this.prisma.transaction.findMany({
        where: {
          ...where,
          paymentStatus: 'PAID',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        include: { member: true, billing: { include: { unit: true } } },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      activeSessions,
      todayRevenue: todayTransactions,
      totalMembers,
      totalUnits,
      usedUnits,
      availableUnits: totalUnits - usedUnits,
      occupancyRate: totalUnits > 0 ? Math.round((usedUnits / totalUnits) * 100) : 0,
      recentTransactions,
    };
  }

  private async getTodayRevenue(branchId?: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const where: any = {
      paymentStatus: 'PAID',
      createdAt: { gte: startOfDay },
    };
    if (branchId) where.branchId = branchId;

    const result = await this.prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getRevenueByPeriod(period: 'day' | 'week' | 'month', branchId?: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const where: any = {
      paymentStatus: 'PAID',
      createdAt: { gte: startDate },
    };
    if (branchId) where.branchId = branchId;

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const grouped: Record<string, number> = {};
    transactions.forEach(t => {
      const date = t.createdAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + Number(t.amount);
    });

    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  }

  async getPeakHours(branchId?: string) {
    const where: any = {};
    if (branchId) where.unit = { branchId };

    const sessions = await this.prisma.billingSession.findMany({
      where: { ...where, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { startTime: true },
    });

    const hourCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourCounts[i] = 0;

    sessions.forEach(s => {
      const hour = s.startTime.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
      label: `${hour}:00`,
    }));
  }

  async getUnitProfitability(branchId?: string) {
    const where: any = {};
    if (branchId) where.branchId = branchId;

    const units = await this.prisma.unit.findMany({
      where,
      include: {
        sessions: {
          where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        },
      },
    });

    return units.map(unit => {
      const totalRevenue = unit.sessions.reduce((sum, s) => sum + Number(s.totalCost), 0);
      const totalHours = unit.sessions.reduce((sum, s) => sum + (s.actualMinutes || s.duration), 0) / 60;
      return {
        id: unit.id,
        name: unit.name,
        type: unit.type,
        totalSessions: unit.sessions.length,
        totalRevenue,
        totalHours: Math.round(totalHours * 100) / 100,
        revenuePerHour: totalHours > 0 ? Math.round(totalRevenue / totalHours * 100) / 100 : 0,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
}
