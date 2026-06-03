import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.inventory.findMany({
      include: { supplier: true },
      orderBy: { name: 'asc' },
    });
  }

  async findLowStock() {
    const items = await this.prisma.inventory.findMany({
      include: { supplier: true },
    });
    return items.filter(item => item.stock <= item.minStock);
  }

  async updateStock(id: string, quantity: number) {
    const item = await this.prisma.inventory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');

    return this.prisma.inventory.update({
      where: { id },
      data: { stock: { increment: quantity } },
    });
  }
}
