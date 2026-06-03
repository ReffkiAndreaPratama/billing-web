import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DynamicPricingService } from './dynamic-pricing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('pricing')
@UseGuards(JwtAuthGuard)
export class DynamicPricingController {
  constructor(private pricing: DynamicPricingService) {}

  @Get('rate/:unitId')
  getRate(@Param('unitId') unitId: string) {
    return this.pricing.getEffectiveRate(unitId);
  }
}
