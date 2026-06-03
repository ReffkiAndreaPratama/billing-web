import { Module } from '@nestjs/common';
import { CafeOrderService } from './cafe-order.service';
import { CafeOrderController } from './cafe-order.controller';

@Module({
  controllers: [CafeOrderController],
  providers: [CafeOrderService],
  exports: [CafeOrderService],
})
export class CafeOrderModule {}
