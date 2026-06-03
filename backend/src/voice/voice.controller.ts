import { Controller, Post, Body, Get } from '@nestjs/common';
import { VoiceService } from './voice.service';

@Controller('voice')
export class VoiceController {
  constructor(private voice: VoiceService) {}

  @Post('process') process(@Body('transcript') transcript: string) { return this.voice.process(transcript); }
  @Get('commands') getCommands() { return this.voice.getCommands(); }
}
