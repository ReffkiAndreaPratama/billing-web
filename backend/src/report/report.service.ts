import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getDailyReport(date: string, branchId?: string) {
    const startDate = new Date(date || new Date().toISOString().split('T')[0]);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const where: any = {
      createdAt: { gte: startDate, lt: endDate },
    };
    if (branchId) where.branchId = branchId;

    const [transactions, sessions, byMethod] = await Promise.all([
      this.prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' } }),
      this.prisma.billingSession.count({
        where: {
          ...where,
          status: 'COMPLETED',
        },
      }),
      this.getTransactionsByMethod(where),
    ]);

    const totalRevenue = transactions
      .filter(t => t.paymentStatus === 'PAID')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      date: startDate.toISOString().split('T')[0],
      totalTransactions: transactions.length,
      totalRevenue,
      completedSessions: sessions,
      paymentMethods: byMethod,
      transactions,
    };
  }

  private async getTransactionsByMethod(where: any) {
    const transactions = await this.prisma.transaction.findMany({
      where: { ...where, paymentStatus: 'PAID' },
    });

    const grouped: Record<string, number> = {};
    transactions.forEach(t => {
      const method = t.paymentMethod || 'UNKNOWN';
      grouped[method] = (grouped[method] || 0) + Number(t.amount);
    });

    return Object.entries(grouped).map(([method, total]) => ({ method, total }));
  }

  async getMemberReport(memberId: string) {
    const [transactions, sessions, loyaltyLogs] = await Promise.all([
      this.prisma.transaction.findMany({ where: { memberId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.billingSession.findMany({ where: { memberId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.loyaltyLog.findMany({ where: { memberId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalSessions: sessions.length,
      totalTransactions: transactions.length,
      totalSpent,
      averageSpentPerVisit: sessions.length > 0 ? totalSpent / sessions.length : 0,
      transactions,
      sessions,
      loyaltyLogs,
    };
  }
}
