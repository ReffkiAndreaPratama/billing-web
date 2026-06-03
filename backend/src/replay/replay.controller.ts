import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ReplayService } from './replay.service';

@Controller('replay')
export class ReplayController {
  constructor(private replay: ReplayService) {}

  @Post('start') start(@Body() dto: { sessionId: string; unitId: string; unitName: string }) { return this.replay.start(dto.sessionId, dto.unitId, dto.unitName); }
  @Post('stop/:id') stop(@Param('id') id: string) { return this.replay.stop(id); }
  @Post('save/:id') save(@Param('id') id: string) { return this.replay.save(id); }
  @Get('list') list(@Param('sessionId') sessionId?: string) { return this.replay.list(sessionId); }
  @Get('list/:sessionId') listBySession(@Param('sessionId') sessionId: string) { return this.replay.list(sessionId); }
}
