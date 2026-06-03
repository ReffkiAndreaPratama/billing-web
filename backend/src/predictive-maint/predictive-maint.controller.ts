import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PredictiveMaintService } from './predictive-maint.service';
@Controller('predictive-maint')
export class PredictiveMaintController {
  constructor(private svc: PredictiveMaintService) {}
  @Get() getPredictions() { return this.svc.getPredictions(); }
  @Get('high-risk') getHighRisk() { return this.svc.getHighRisk(); }
  @Post('analyze/:unitId') analyze(@Param('unitId') unitId: string, @Body('temperature') t: number, @Body('uptimeHours') u: number, @Body('diskHealth') d: number) { return this.svc.analyze(unitId, t || 70, u || 100, d || 50); }
}
