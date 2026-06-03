import { Module } from '@nestjs/common';
import { DynamicPricingService } from './dynamic-pricing.service';
import { DynamicPricingController } from './dynamic-pricing.controller';

@Module({
  controllers: [DynamicPricingController],
  providers: [DynamicPricingService],
  exports: [DynamicPricingService],
})
export class DynamicPricingModule {}
