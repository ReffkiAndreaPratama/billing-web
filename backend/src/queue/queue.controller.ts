import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('queue')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private queue: QueueService) {}

  @Get(':branchId')
  getQueue(@Param('branchId') branchId: string) {
    return this.queue.getQueue(branchId);
  }

  @Post('join')
  join(@Body() dto: { customerName: string; customerPhone?: string; requestedUnitType?: string; notes?: string; branchId: string }) {
    return this.queue.addToQueue(dto);
  }

  @Post('serve/:id')
  serve(@Param('id') id: string) {
    return this.queue.serveCustomer(id);
  }

  @Post('cancel/:id')
  cancel(@Param('id') id: string) {
    return this.queue.cancelQueue(id);
  }

  @Get('estimate/:branchId')
  estimate(@Param('branchId') branchId: string, @Query('unitType') unitType?: string) {
    return this.queue.estimateWaitTime(branchId, unitType);
  }
}
