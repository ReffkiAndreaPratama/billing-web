import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private cb: ChatbotService) {}

  @Post('ask') ask(@Body() dto: { question: string; sessionId: string }) { return this.cb.ask(dto.question, dto.sessionId); }
  @Get('history') getHistory() { return this.cb.getHistory(); }
  @Get('faq') getFaq() { return this.cb.getFaq(); }
}
