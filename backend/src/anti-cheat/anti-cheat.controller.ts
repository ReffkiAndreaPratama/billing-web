import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AntiCheatService } from './anti-cheat.service';

@Controller('anti-cheat')
export class AntiCheatController {
  constructor(private ac: AntiCheatService) {}

  @Post('scan') scan(@Body('unitId') unitId: string) { return this.ac.scan(unitId); }
  @Get('reports') getReports(@Param('unitId') unitId?: string) { return this.ac.getReports(unitId); }
  @Get('blacklist') blacklist() { return this.ac.getBlacklist(); }
  @Post('blacklist') addBlacklist(@Body('processName') processName: string) { this.ac.addBlacklist(processName); return { success: true }; }
}
