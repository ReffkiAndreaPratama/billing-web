import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { SmartEnergyService } from './smart-energy.service';
@Controller('smart-energy')
export class SmartEnergyController {
  constructor(private svc: SmartEnergyService) {}
  @Get('stats') stats() { return this.svc.getStats(); }
  @Get('total') total() { return { totalWatts: this.svc.getTotalPower(), totalCost: this.svc.getTotalCost() }; }
  @Post('sleep/:unitId') sleep(@Param('unitId') unitId: string) { return this.svc.autoSleep(unitId); }
  @Post('wake/:unitId') wake(@Param('unitId') unitId: string) { return this.svc.wake(unitId); }
  @Post('sleep-all-idle') sleepAll(@Body('thresholdMinutes') t: number) { return this.svc.sleepAllIdle(t || 30); }
  @Get('savings') savings() { return this.svc.savings(); }
}
