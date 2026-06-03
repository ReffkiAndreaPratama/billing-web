import { Controller, Get, Post, Body } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  constructor(private dc: DiscordService) {}

  @Post('send') send(@Body() dto: { channel: string; message: string }) { return this.dc.send(dto.channel, dto.message); }
  @Get('logs') getLogs() { return this.dc.getLogs(); }
  @Get('commands') getCommands() { return this.dc.getCommands(); }
}
