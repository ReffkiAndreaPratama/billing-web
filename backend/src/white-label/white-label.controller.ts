import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { WhiteLabelService } from './white-label.service';
@Controller('white-label')
export class WhiteLabelController {
  constructor(private svc: WhiteLabelService) {}
  @Get('tenants') getTenants() { return this.svc.getTenants(); }
  @Get('tenant/:id') getTenant(@Param('id') id: string) { return this.svc.getTenant(id); }
  @Post('register') register(@Body() dto: any) { return this.svc.register(dto); }
  @Post('toggle/:id') toggle(@Param('id') id: string) { return this.svc.toggle(id); }
  @Get('plans') getPlans() { return this.svc.getPlans(); }
}
