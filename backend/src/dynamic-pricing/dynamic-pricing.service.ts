import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DynamicPricingService {
  constructor(private prisma: PrismaService) {}

  async getEffectiveRate(unitId: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) return { hourlyRate: 0, reason: 'Unit not found', multiplier: 1 };

    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0=Sun, 6=Sat
    const isWeekend = day === 0 || day === 6;

    let multiplier = 1;
    let reason = 'Standard rate';

    // Peak hours (18:00-23:00) - weekend premium
    if (hour >= 18 || hour < 6) {
      multiplier = isWeekend ? 1.3 : 1.15;
      reason = isWeekend ? 'Weekend peak hours' : 'Peak hours';
    }
    // Happy hour (10:00-14:00) - discount
    else if (hour >= 10 && hour <= 14) {
      multiplier = 0.85;
      reason = 'Happy hour discount';
    }
    // Late night (23:00-06:00)
    else if (hour >= 23 || hour < 6) {
      multiplier = 1.2;
      reason = 'Late night rate';
    }

    // Occupancy-based adjustment
    const totalUnits = await this.prisma.unit.count({ where: { branchId: unit.branchId } });
    const usedUnits = await this.prisma.billingSession.count({
      where: { unit: { branchId: unit.branchId }, status: { in: ['ACTIVE', 'PAUSED'] } },
    });
    const occupancyRate = totalUnits > 0 ? usedUnits / totalUnits : 0;

    if (occupancyRate > 0.8) {
      multiplier *= 1.1;
      reason += ', High occupancy surcharge';
    } else if (occupancyRate < 0.3) {
      multiplier *= 0.9;
      reason += ', Low occupancy discount';
    }

    const effectiveRate = unit.hourlyRate * multiplier;

    return {
      baseRate: unit.hourlyRate,
      multiplier,
      effectiveRate: Math.round(effectiveRate),
      reason,
      occupancyRate: Math.round(occupancyRate * 100),
      hour,
      isWeekend,
    };
  }
}
