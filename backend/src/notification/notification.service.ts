import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway,
  ) {}

  async sendInApp(userId: string, title: string, message: string, type = 'INAPP'): Promise<any> {
    const notification = await this.prisma.notification.create({
      data: { type, title, message, recipient: userId, userId, status: 'SENT' },
    });
    this.gateway.emitToUser(userId, 'notification:new', notification);
    return notification;
  }

  async sendWhatsApp(phone: string, message: string) {
    console.log(`[WA] To ${phone}: ${message}`);
    await this.prisma.notification.create({
      data: { type: 'WA', title: 'WhatsApp', message, recipient: phone, status: 'SENT' },
    });
    return { sent: true, channel: 'whatsapp', phone, message };
  }

  async sendTelegram(chatId: string, message: string) {
    console.log(`[Telegram] To ${chatId}: ${message}`);
    await this.prisma.notification.create({
      data: { type: 'TELEGRAM', title: 'Telegram', message, recipient: chatId, status: 'SENT' },
    });
    return { sent: true, channel: 'telegram', chatId, message };
  }

  async sendVoiceNotification(text: string) {
    console.log(`[Voice] ${text}`);
    return { sent: true, channel: 'voice', text };
  }

  async notifyBookingReminder(booking: any) {
    const minutesUntil = Math.floor((new Date(booking.startTime).getTime() - Date.now()) / 60000);
    if (minutesUntil <= 0) return;
    const message = `Reminder: Booking ${booking.code} at ${new Date(booking.startTime).toLocaleTimeString()} (${minutesUntil}m again)`;
    if (booking.member?.phone) await this.sendWhatsApp(booking.member.phone, message);
  }

  async notifySessionEnd(session: any) {
    const message = `Session ${session.unit?.name} has ended. Cost: Rp ${session.totalCost?.toLocaleString()}`;
    this.gateway.broadcast('billing:notification', { message, type: 'SESSION_END', sessionId: session.id });
    if (session.member?.phone) {
      await this.sendWhatsApp(session.member.phone, `Waktu bermain di ${session.unit?.name} sudah habis.`);
    }
  }

  async notifyLowStock(item: any) {
    const message = `Stock Alert: ${item.name} is running low (${item.stock} left)`;
    this.gateway.broadcast('notification:stock', { message, itemId: item.id, stock: item.stock });
  }

  async getNotifications(userId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
