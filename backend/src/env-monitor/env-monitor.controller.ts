import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { EnvMonitorService } from './env-monitor.service';

@Controller('env-monitor')
export class EnvMonitorController {
  constructor(private em: EnvMonitorService) {}

  @Post('read/:roomId') read(@Param('roomId') roomId: string) { return this.em.read(roomId); }
  @Get('history/:roomId') getHistory(@Param('roomId') roomId: string, @Query('limit') limit?: string) { return this.em.getHistory(roomId, limit ? parseInt(limit) : 20); }
  @Get('alerts') getAlerts() { return this.em.getAlerts(); }
}
