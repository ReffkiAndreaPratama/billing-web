import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    unitId: string;
    startTime: string;
    duration: number;
    memberId?: string;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }) {
    const unit = await this.prisma.unit.findUnique({ where: { id: data.unitId } });
    if (!unit) throw new NotFoundException('Unit not found');

    const start = new Date(data.startTime);
    const end = new Date(start.getTime() + data.duration * 60000);

    const conflict = await this.prisma.booking.findFirst({
      where: {
        unitId: data.unitId,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } },
        ],
      },
    });
    if (conflict) throw new BadRequestException('Unit is already booked for this time');

    const count = await this.prisma.booking.count();
    const code = `BOK-${String(count + 1).padStart(5, '0')}`;
    const totalCost = unit.hourlyRate * (data.duration / 60);
    const deposit = totalCost * 0.2;

    return this.prisma.booking.create({
      data: {
        code,
        startTime: start,
        endTime: end,
        duration: data.duration,
        totalCost,
        deposit,
        unitId: data.unitId,
        memberId: data.memberId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        notes: data.notes,
        status: 'PENDING',
      },
      include: { unit: true },
    });
  }

  async findAll(query: { status?: string; branchId?: string; page?: number; limit?: number }) {
    const { status, branchId, page = 1, limit = 20 } = query;
    const where: any = {};
    if (status) where.status = status;
    if (branchId) where.unit = { branchId };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { unit: true, member: true },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (status === 'CHECKED_IN') {
      await this.prisma.unit.update({
        where: { id: booking.unitId },
        data: { status: 'BOOKED' },
      });
    }

    if (status === 'COMPLETED' || status === 'CANCELLED') {
      await this.prisma.unit.update({
        where: { id: booking.unitId },
        data: { status: 'AVAILABLE' },
      });
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
