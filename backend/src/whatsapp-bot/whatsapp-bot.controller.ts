import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { WhatsAppBotService } from './whatsapp-bot.service';
@Controller('whatsapp-bot')
export class WhatsAppBotController {
  constructor(private svc: WhatsAppBotService) {}
  @Post('webhook') webhook(@Body() body: any) { if (body.message) { const r = this.svc.handleMessage(body.from || '', body.message || ''); return { reply: r }; } return { ok: true }; }
  @Post('register') register(@Body('phone') phone: string, @Body('name') name: string, @Body('branchId') branchId: string) { return this.svc.register(phone, name, branchId || 'main'); }
  @Post('broadcast') broadcast(@Body('message') message: string) { return { sent: this.svc.broadcast(message || '') }; }
  @Get('contacts') contacts() { return this.svc.getContacts(); }
  @Get('auto-replies') autoReplies() { return this.svc.getAutoReplies(); }
  @Get('simulate') simulate(@Query('text') text: string, @Query('phone') phone: string) { return { reply: this.svc.handleMessage(phone || '628123456789', text || 'menu') }; }
}
