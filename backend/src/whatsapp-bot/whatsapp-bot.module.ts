import { Module } from '@nestjs/common';
import { WhatsAppBotService } from './whatsapp-bot.service';
import { WhatsAppBotController } from './whatsapp-bot.controller';
@Module({ controllers: [WhatsAppBotController], providers: [WhatsAppBotService], exports: [WhatsAppBotService] })
export class WhatsAppBotModule {}
