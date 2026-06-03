import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CafeOrderService } from './cafe-order.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('cafe')
@UseGuards(JwtAuthGuard)
export class CafeOrderController {
  constructor(private cafe: CafeOrderService) {}

  @Get('menu')
  getMenu(@Query('category') category?: string) { return this.cafe.getMenu(category); }

  @Get('categories')
  getCategories() { return this.cafe.getCategories(); }

  @Post('order')
  createOrder(@Body() dto: { unitId: string; items: { menuItemId: string; quantity: number; notes?: string }[] }) {
    return this.cafe.createOrder(dto.unitId, dto.items);
  }

  @Get('orders')
  getOrders(@Query('unitId') unitId?: string) { return this.cafe.getOrders(unitId); }

  @Patch('order/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.cafe.updateStatus(id, status as any);
  }

  @Get('revenue/today')
  todayRevenue() { return { revenue: this.cafe.todayRevenue() }; }
}
