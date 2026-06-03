import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private report: ReportService) {}

  @Get('daily')
  getDaily(@Query('date') date: string, @Query('branchId') branchId?: string) {
    return this.report.getDailyReport(date, branchId);
  }

  @Get('member/:memberId')
  getMemberReport(@Param('memberId') memberId: string) {
    return this.report.getMemberReport(memberId);
  }
}
