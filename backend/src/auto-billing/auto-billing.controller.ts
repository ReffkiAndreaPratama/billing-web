import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AutoBillingService } from './auto-billing.service';
@Controller('auto-billing')
export class AutoBillingController {
  constructor(private svc: AutoBillingService) {}
  @Post('pc-on') pcOn(@Body('unitId') unitId: string, @Body('memberId') memberId?: string) { return this.svc.pcPowerOn(unitId, memberId || ''); }
  @Post('pc-off') pcOff(@Body('unitId') unitId: string) { return this.svc.pcPowerOff(unitId); }
  @Get('active') active() { return this.svc.getActive(); }
  @Get('history') history() { return this.svc.getHistory(); }
}
