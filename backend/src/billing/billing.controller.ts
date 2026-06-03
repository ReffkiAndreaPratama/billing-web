import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { StartBillingDto } from './billing.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private billing: BillingService) {}

  @Post('start')
  start(@Body() dto: StartBillingDto, @CurrentUser('id') userId: string) {
    return this.billing.startSession(dto, userId);
  }

  @Post(':id/end')
  end(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.billing.endSession(id, userId);
  }

  @Post(':id/pause')
  pause(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.billing.pauseSession(id, reason);
  }

  @Post(':id/resume')
  resume(@Param('id') id: string) {
    return this.billing.resumeSession(id);
  }

  @Get('active')
  getActive(@Query('branchId') branchId?: string) {
    return this.billing.getActiveSessions(branchId);
  }

  @Get('history')
  getHistory(@Query() query: any) {
    return this.billing.getSessionHistory(query);
  }
}
