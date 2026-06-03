import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@Query('branchId') branchId?: string) {
    return this.analytics.getDashboard(branchId);
  }

  @Get('revenue')
  getRevenue(@Query('period') period: 'day' | 'week' | 'month', @Query('branchId') branchId?: string) {
    return this.analytics.getRevenueByPeriod(period || 'day', branchId);
  }

  @Get('peak-hours')
  getPeakHours(@Query('branchId') branchId?: string) {
    return this.analytics.getPeakHours(branchId);
  }

  @Get('unit-profitability')
  getUnitProfitability(@Query('branchId') branchId?: string) {
    return this.analytics.getUnitProfitability(branchId);
  }
}
