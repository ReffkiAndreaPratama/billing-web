import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VoucherService {
  constructor(private prisma: PrismaService) {}

  async generate(data: { code: string; discountType: 'PERCENTAGE' | 'NOMINAL'; discountValue: number; minPurchase?: number; maxUses?: number; validFrom?: string; validUntil?: string; branchId?: string; description?: string; name?: string; daysOfWeek?: string }) {
    const existing = await this.prisma.promo.findUnique({ where: { code: data.code } });
    if (existing) throw new Error('Voucher code already exists');

    return this.prisma.promo.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name || data.code.toUpperCase(),
        type: data.discountType,
        value: data.discountValue,
        minPurchase: data.minPurchase || 0,
        maxUsage: data.maxUses || 0,
        startDate: data.validFrom ? new Date(data.validFrom) : new Date(),
        endDate: data.validUntil ? new Date(data.validUntil) : new Date(Date.now() + 30 * 24 * 3600000),
        isActive: true,
        branchId: data.branchId ?? null,
        daysOfWeek: data.daysOfWeek ?? '',
        description: data.description ?? null,
      },
    });
  }

  async validate(code: string, amount: number, memberId?: string) {
    const promo = await this.prisma.promo.findUnique({ where: { code: code.toUpperCase() } });
    if (!promo) throw new Error('Invalid voucher code');
    if (!promo.isActive) throw new Error('Voucher is inactive');
    if (promo.maxUsage > 0 && promo.usedCount >= promo.maxUsage) throw new Error('Voucher usage limit reached');
    if (promo.endDate && new Date() > promo.endDate) throw new Error('Voucher has expired');
    if (promo.startDate && new Date() < promo.startDate) throw new Error('Voucher is not yet valid');
    if (promo.minPurchase && amount < promo.minPurchase) throw new Error(`Minimum purchase Rp ${promo.minPurchase.toLocaleString()}`);

    const discount = promo.type === 'PERCENTAGE'
      ? Math.round(amount * promo.value / 100)
      : promo.value;
    const finalAmount = Math.max(0, amount - discount);

    return { valid: true, promo, discount, finalAmount };
  }

  async use(code: string) {
    return this.prisma.promo.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }

  async list(branchId?: string) {
    const where: any = {};
    if (branchId) where.branchId = branchId;
    return this.prisma.promo.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async generateReferralCode(memberId: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new Error('Member not found');
    const referralCode = `RFL-${member.code || memberId.slice(0, 6).toUpperCase()}`;
    return { referralCode };
  }

  async processReferral(referrerId: string, newMemberId: string) {
    await this.awardPoints(referrerId, 100, 'referral');
    await this.awardPoints(newMemberId, 50, 'referral_signup');
    return { referrerId, newMemberId, referrerPoints: 100, newMemberPoints: 50 };
  }

  private async awardPoints(memberId: string, points: number, source: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) return;
    const newBal = member.totalPoints + points;
    await this.prisma.member.update({
      where: { id: memberId },
      data: { totalPoints: newBal },
    });
    await this.prisma.loyaltyLog.create({
      data: { memberId, points, type: 'EARN', source, balanceAfter: newBal },
    });
  }
}
