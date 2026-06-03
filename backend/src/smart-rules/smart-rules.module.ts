import { Module } from '@nestjs/common';
import { SmartRulesService } from './smart-rules.service';
import { SmartRulesController } from './smart-rules.controller';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [BillingModule],
  controllers: [SmartRulesController],
  providers: [SmartRulesService],
  exports: [SmartRulesService],
})
export class SmartRulesModule {}
