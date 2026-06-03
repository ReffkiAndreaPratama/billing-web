import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
@Controller('telegram-bot')
export class TelegramBotController {
  constructor(private svc: TelegramBotService) {}
  @Post('webhook') webhook(@Body() body: any) { if (body.message) { const r = this.svc.handleMessage(body.message.chat.id.toString(), body.message.text || ''); return { reply: r }; } return { ok: true }; }
  @Post('subscribe') subscribe(@Body('chatId') chatId: string, @Body('username') username: string, @Body('branchId') branchId: string) { return this.svc.subscribe(chatId, username, branchId || 'main'); }
  @Post('unsubscribe') unsubscribe(@Body('chatId') chatId: string) { this.svc.unsubscribe(chatId); return { ok: true }; }
  @Post('broadcast') broadcast(@Body('message') message: string) { const sent = this.svc.broadcast(message || ''); return { sent }; }
  @Get('commands') commands() { return this.svc.getCommands(); }
  @Get('subscribers') subscribers() { return this.svc.getSubscribers(); }
  @Get('simulate') simulate(@Query('text') text: string, @Query('chatId') chatId: string) { return { reply: this.svc.handleMessage(chatId || '123', text || '/help') }; }
}
