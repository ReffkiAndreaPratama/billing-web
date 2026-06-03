import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InternetMgmtService } from './internet-mgmt.service';
@Controller('internet-mgmt')
export class InternetMgmtController {
  constructor(private svc: InternetMgmtService) {}
  @Get('rules') getRules() { return this.svc.getRules(); }
  @Get('blocks') getBlocks() { return this.svc.getBlocks(); }
  @Get('pc-limits') getPcLimits() { return this.svc.getPcLimits(); }
  @Get('usage') getUsage() { return this.svc.getUsage(); }
  @Post('pc-limit') setPcLimit(@Body('unitId') unitId: string, @Body('mbps') mbps: number) { return this.svc.setPcLimit(unitId, mbps); }
  @Post('block/toggle') toggleBlock(@Body('url') url: string) { return this.svc.toggleBlock(url); }
  @Post('rule/toggle/:id') toggleRule(@Param('id') id: string) { return this.svc.toggleRule(id); }
}
