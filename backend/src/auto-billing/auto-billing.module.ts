import { Module } from '@nestjs/common';
import { AutoBillingService } from './auto-billing.service';
import { AutoBillingController } from './auto-billing.controller';
@Module({ controllers: [AutoBillingController], providers: [AutoBillingService], exports: [AutoBillingService] })
export class AutoBillingModule {}
