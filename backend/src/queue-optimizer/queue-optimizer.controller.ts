import { Controller, Get, Post, Body } from '@nestjs/common';
import { QueueOptimizerService } from './queue-optimizer.service';
@Controller('queue-optimizer')
export class QueueOptimizerController {
  constructor(private svc: QueueOptimizerService) {}
  @Post('add') add(@Body('name') name: string, @Body('size') size: number, @Body('prefType') prefType?: string) { return this.svc.addToQueue(name, size, prefType || ''); }
  @Get('optimize') optimize() { return this.svc.optimize(); }
  @Get('queue') queue() { return this.svc.getQueue(); }
}
