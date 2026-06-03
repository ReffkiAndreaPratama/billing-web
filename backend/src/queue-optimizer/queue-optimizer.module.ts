import { Module } from '@nestjs/common';
import { QueueOptimizerService } from './queue-optimizer.service';
import { QueueOptimizerController } from './queue-optimizer.controller';
@Module({ controllers: [QueueOptimizerController], providers: [QueueOptimizerService], exports: [QueueOptimizerService] })
export class QueueOptimizerModule {}
