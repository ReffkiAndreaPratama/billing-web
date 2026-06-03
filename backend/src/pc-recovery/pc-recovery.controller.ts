import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PcRecoveryService } from './pc-recovery.service';

@Controller('pc-recovery')
export class PcRecoveryController {
  constructor(private rcv: PcRecoveryService) {}

  @Post('restart') restart(@Body() dto: { unitId: string; unitName: string }) { return this.rcv.restart(dto.unitId, dto.unitName); }
  @Post('shutdown') shutdown(@Body() dto: { unitId: string; unitName: string }) { return this.rcv.shutdown(dto.unitId, dto.unitName); }
  @Post('reimage') reimage(@Body() dto: { unitId: string; unitName: string }) { return this.rcv.reimage(dto.unitId, dto.unitName); }
  @Get('logs') getLogs(@Param('unitId') unitId?: string) { return this.rcv.getLogs(unitId); }
  @Get('logs/:unitId') getLogsByUnit(@Param('unitId') unitId: string) { return this.rcv.getLogs(unitId); }
}
