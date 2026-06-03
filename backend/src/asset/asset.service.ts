import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; type: string; serialNumber?: string; unitId?: string; purchaseDate?: string; purchasePrice?: number; condition?: string; notes?: string }) {
    return this.prisma.asset.create({
      data: {
        name: data.name,
        type: data.type,
        serialNumber: data.serialNumber,
        unitId: data.unitId,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        purchasePrice: data.purchasePrice,
        condition: data.condition || 'GOOD',
        notes: data.notes,
      },
    });
  }

  async list(branchId?: string) {
    const where: any = {};
    if (branchId) where.unit = { branchId };
    return this.prisma.asset.findMany({
      where,
      include: { unit: { select: { id: true, name: true, code: true, branchId: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async addMaintenance(unitId: string, data: { description: string; cost?: number; type: string; scheduledAt?: string }) {
    return this.prisma.maintenance.create({
      data: {
        unitId,
        description: data.description,
        cost: data.cost || 0,
        type: data.type,
        status: 'SCHEDULED',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : new Date(),
      },
    });
  }

  async getHistory(unitId: string) {
    return this.prisma.maintenance.findMany({
      where: { unitId },
      include: { unit: { select: { id: true, name: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async completeMaintenance(id: string, notes?: string) {
    return this.prisma.maintenance.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date(), notes },
    });
  }
}
