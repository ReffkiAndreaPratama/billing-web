import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; phone: string; email?: string; position: string; salary?: number; userId?: string; branchId?: string }) {
    return this.prisma.employee.create({ data });
  }

  async list(branchId?: string) {
    const where: any = {};
    if (branchId) where.branchId = branchId;
    return this.prisma.employee.findMany({ where, include: { user: { select: { id: true, name: true, username: true } } }, orderBy: { name: 'asc' } });
  }

  async clockIn(employeeId: string) {
    return this.prisma.attendance.create({
      data: { employeeId, clockIn: new Date() },
    });
  }

  async clockOut(id: string) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id } });
    if (!attendance) throw new Error('Attendance not found');
    const clockOut = new Date();
    const hoursWorked = Math.round(((clockOut.getTime() - attendance.clockIn.getTime()) / 3600000) * 100) / 100;
    return this.prisma.attendance.update({
      where: { id },
      data: { clockOut, hoursWorked },
    });
  }

  async attendance(branchId?: string, from?: string, to?: string) {
    const where: any = {};
    if (branchId) where.employee = { branchId };
    if (from || to) {
      where.clockIn = {};
      if (from) where.clockIn.gte = new Date(from);
      if (to) where.clockIn.lte = new Date(to);
    }
    return this.prisma.attendance.findMany({
      where,
      include: { employee: { include: { user: { select: { id: true, name: true } } } } },
      orderBy: { clockIn: 'desc' },
    });
  }
}
