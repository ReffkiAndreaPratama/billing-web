import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventory: InventoryService) {}

  @Get()
  findAll() {
    return this.inventory.findAll();
  }

  @Get('low-stock')
  findLowStock() {
    return this.inventory.findLowStock();
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.inventory.updateStock(id, quantity);
  }
}
