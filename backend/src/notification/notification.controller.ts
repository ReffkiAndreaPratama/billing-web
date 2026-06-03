import { Controller, Post, Get, Param, Body, UseGuards, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notification: NotificationService) {}

  @Get()
  list(@CurrentUser('id') userId: string, @Query('limit') limit?: string) {
    return this.notification.getNotifications(userId, limit ? Number(limit) : 20);
  }

  @Post('send')
  send(@Body() dto: { userId: string; title: string; message: string; type?: string }) {
    return this.notification.sendInApp(dto.userId, dto.title, dto.message, dto.type);
  }

  @Post('whatsapp')
  sendWhatsApp(@Body() dto: { phone: string; message: string }) {
    return this.notification.sendWhatsApp(dto.phone, dto.message);
  }

  @Post('telegram')
  sendTelegram(@Body() dto: { chatId: string; message: string }) {
    return this.notification.sendTelegram(dto.chatId, dto.message);
  }

  @Post('voice')
  sendVoice(@Body() dto: { text: string }) {
    return this.notification.sendVoiceNotification(dto.text);
  }

  @Post('booking-reminder')
  bookingReminder(@Body() dto: { bookingId: string }) {
    return { message: 'Queued' };
  }
}
