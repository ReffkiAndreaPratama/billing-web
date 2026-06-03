import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { BillingGateway } from './billing.gateway';

@Module({
  controllers: [BillingController],
  providers: [BillingService, BillingGateway],
  exports: [BillingService, BillingGateway],
})
export class BillingModule {}
