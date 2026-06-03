import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string; type: string; startDate: string; endDate: string; maxParticipants?: number; branchId?: string; entryFee?: number; prizePool?: number }) {
    return this.prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxParticipants: data.maxParticipants,
        branchId: data.branchId,
        entryFee: data.entryFee,
        prizePool: data.prizePool,
        status: 'UPCOMING',
      },
    });
  }

  async list(branchId?: string) {
    const where: any = {};
    if (branchId) where.branchId = branchId;
    return this.prisma.event.findMany({ where, orderBy: { startDate: 'desc' } });
  }

  async register(eventId: string, memberId: string) {
    return this.prisma.eventRegistration.create({
      data: { eventId, memberId, status: 'REGISTERED' },
    });
  }
}
