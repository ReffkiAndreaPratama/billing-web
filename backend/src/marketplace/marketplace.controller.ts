import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('marketplace')
@UseGuards(JwtAuthGuard)
export class MarketplaceController {
  constructor(private mp: MarketplaceService) {}

  @Get('products') getProducts(@Query('category') category?: string) { return this.mp.getProducts(category); }
  @Get('categories') getCategories() { return this.mp.getCategories(); }

  @Post('buy')
  purchase(@Body() dto: { productId: string; quantity: number; buyerName: string; buyerId: string }) {
    return this.mp.purchase(dto);
  }

  @Get('purchases')
  getPurchases(@Query('buyerId') buyerId?: string) { return this.mp.getPurchases(buyerId); }

  @Get('revenue/today')
  today() { return { revenue: this.mp.todayRevenue() }; }
}
