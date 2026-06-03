import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async awardPoints(memberId: string, points: number, source: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new Error('Member not found');

    const newPoints = member.totalPoints + points;
    const newVisitCount = source === 'billing' ? member.visitCount + 1 : member.visitCount;
    const newTotalSpent = source === 'billing' ? member.totalSpent + points * 100 : member.totalSpent;
    const tier = this.calculateTier(newTotalSpent);

    await this.prisma.member.update({
      where: { id: memberId },
      data: { totalPoints: newPoints, totalSpent: newTotalSpent, visitCount: newVisitCount, tier: tier as any },
    });

    await this.prisma.loyaltyLog.create({
      data: { memberId, points, type: 'EARN', source, balanceAfter: newPoints },
    });

    return { totalPoints: newPoints, tier, source };
  }

  async redeemPoints(memberId: string, points: number, description: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member || member.totalPoints < points) throw new Error('Insufficient points');

    const newBalance = member.totalPoints - points;

    await this.prisma.member.update({
      where: { id: memberId },
      data: { totalPoints: newBalance },
    });

    await this.prisma.loyaltyLog.create({
      data: { memberId, points: -points, type: 'REDEEM', description, balanceAfter: newBalance },
    });

    return { totalPoints: newBalance };
  }

  async getLeaderboard(branchId?: string, limit = 20) {
    const where: any = {};
    if (branchId) where.branchId = branchId;
    return this.prisma.member.findMany({
      where,
      orderBy: { totalPoints: 'desc' },
      take: limit,
      select: { id: true, code: true, name: true, tier: true, totalPoints: true, totalSpent: true, visitCount: true },
    });
  }

  async getLogs(memberId: string) {
    return this.prisma.loyaltyLog.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private calculateTier(totalSpent: number): string {
    if (totalSpent >= 5000000) return 'DIAMOND';
    if (totalSpent >= 2000000) return 'PLATINUM';
    if (totalSpent >= 1000000) return 'GOLD';
    if (totalSpent >= 500000) return 'SILVER';
    return 'BRONZE';
  }
}
