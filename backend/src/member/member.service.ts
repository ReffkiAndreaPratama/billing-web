import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto, TopupDto } from './member.dto';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; tier?: string; branchId?: string; page?: number; limit?: number }) {
    const { search, tier, branchId, page = 1, limit = 20 } = query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { code: { contains: search } },
      ];
    }
    if (tier) where.tier = tier;
    if (branchId) where.branchId = branchId;

    const [data, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.member.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        sessions: { take: 10, orderBy: { createdAt: 'desc' } },
        transactions: { take: 10, orderBy: { createdAt: 'desc' } },
        loyaltyLogs: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async findByRfid(rfidTag: string) {
    const member = await this.prisma.member.findUnique({ where: { rfidTag } });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async create(dto: CreateMemberDto) {
    const existing = await this.prisma.member.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Phone already registered');

    const count = await this.prisma.member.count();
    const code = `MBR-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.member.create({
      data: {
        code,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        rfidTag: dto.rfidTag,
        branchId: dto.branchId,
      },
    });
  }

  async topup(id: string, dto: TopupDto, userId: string) {
    const member = await this.findById(id);
    const [updated] = await Promise.all([
      this.prisma.member.update({
        where: { id },
        data: { balance: { increment: dto.amount } },
      }),
      this.prisma.transaction.create({
        data: {
          invoiceNumber: `TOP-${Date.now()}`,
          type: 'TOPUP',
          amount: dto.amount,
          paymentMethod: dto.paymentMethod || 'CASH',
          paymentStatus: 'PAID',
          memberId: id,
          userId,
          branchId: member.branchId,
        },
      }),
    ]);
    return updated;
  }

  async getByPhone(phone: string) {
    const member = await this.prisma.member.findUnique({ where: { phone } });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }
}
