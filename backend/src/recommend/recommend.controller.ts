import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('recommend')
@UseGuards(JwtAuthGuard)
export class RecommendController {
  constructor(private rec: RecommendService) {}

  @Get()
  getRecommendations(@Query('memberId') memberId?: string, @Query('hour') hour?: string) {
    return this.rec.getRecommendations(memberId, hour ? parseInt(hour) : undefined);
  }

  @Get('peak-hours')
  getPeakHours() { return this.rec.getPeakHours(); }

  @Post('record')
  recordHistory(@Body() dto: { memberId: string; packageName: string }) {
    this.rec.recordHistory(dto.memberId, dto.packageName);
    return { success: true };
  }
}
