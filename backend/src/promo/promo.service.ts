import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string) {
    const where: any = { isActive: true };
    if (branchId) where.branchId = branchId;
    return this.prisma.promo.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async validate(code: string, amount: number) {
    const promo = await this.prisma.promo.findUnique({ where: { code } });
    if (!promo) throw new NotFoundException('Promo not found');
    if (!promo.isActive) throw new NotFoundException('Promo is inactive');
    if (promo.endDate < new Date()) throw new NotFoundException('Promo expired');
    if (promo.maxUsage > 0 && promo.usedCount >= promo.maxUsage) throw new NotFoundException('Promo usage limit reached');
    if (amount < promo.minPurchase) throw new NotFoundException(`Minimum purchase: ${promo.minPurchase}`);

    let discount = 0;
    if (promo.type === 'PERCENTAGE') {
      discount = (amount * promo.value) / 100;
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else if (promo.type === 'NOMINAL') {
      discount = promo.value;
    }

    await this.prisma.promo.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });

    return { promo, discount, totalAfter: amount - discount };
  }
}
