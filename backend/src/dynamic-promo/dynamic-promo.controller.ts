import { Controller, Get, Post, Body } from '@nestjs/common';
import { DynamicPromoService } from './dynamic-promo.service';
@Controller('dynamic-promo')
export class DynamicPromoController {
  constructor(private svc: DynamicPromoService) {}
  @Post('generate') generate(@Body('occupancy') occupancy: number, @Body('hour') hour: number) { return this.svc.generatePromo(occupancy, hour); }
  @Get('active') getActive() { return this.svc.getActivePromos(); }
}
