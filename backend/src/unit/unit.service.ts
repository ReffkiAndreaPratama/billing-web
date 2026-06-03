import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto } from './unit.dto';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string) {
    const where = branchId ? { branchId } : {};
    return this.prisma.unit.findMany({
      where,
      include: { _count: { select: { sessions: true, bookings: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: { branch: true },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async create(dto: CreateUnitDto) {
    return this.prisma.unit.create({
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type,
        hourlyRate: dto.hourlyRate,
        vipRate: dto.vipRate,
        positionX: dto.positionX,
        positionY: dto.positionY,
        width: dto.width,
        height: dto.height,
        specs: dto.specs,
        branchId: dto.branchId,
      },
    });
  }

  async update(id: string, dto: UpdateUnitDto) {
    await this.findById(id);
    return this.prisma.unit.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: string) {
    await this.findById(id);
    return this.prisma.unit.update({ where: { id }, data: { status: status as any } });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.unit.update({ where: { id }, data: { isActive: false } });
  }

  async getMap(branchId: string) {
    return this.prisma.unit.findMany({
      where: { branchId, isActive: true },
      select: {
        id: true, name: true, code: true, type: true, status: true,
        positionX: true, positionY: true, width: true, height: true,
        hourlyRate: true, vipRate: true,
      },
      orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
    });
  }
}
