import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { UnitModule } from './unit/unit.module';
import { MemberModule } from './member/member.module';
import { PaymentModule } from './payment/payment.module';
import { BookingModule } from './booking/booking.module';
import { ShiftModule } from './shift/shift.module';
import { PromoModule } from './promo/promo.module';
import { TournamentModule } from './tournament/tournament.module';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationModule } from './notification/notification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportModule } from './report/report.module';
import { SocketModule } from './socket/socket.module';
import { ConfigModule } from './config/config.module';
import { AgentModule } from './agent/agent.module';
import { WebhookModule } from './webhook/webhook.module';
import { EmployeeModule } from './employee/employee.module';
import { AssetModule } from './asset/asset.module';
import { GamificationModule } from './gamification/gamification.module';
import { VoucherModule } from './voucher/voucher.module';
import { QueueModule } from './queue/queue.module';
import { PrinterModule } from './printer/printer.module';
import { DynamicPricingModule } from './dynamic-pricing/dynamic-pricing.module';
import { SmartRulesModule } from './smart-rules/smart-rules.module';
import { EventModule } from './event/event.module';
import { PublicApiModule } from './public-api/public-api.module';
import { BackupModule } from './backup/backup.module';
import { SyncModule } from './sync/sync.module';
import { CafeOrderModule } from './cafe-order/cafe-order.module';
import { LeagueModule } from './league/league.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { IotModule } from './iot/iot.module';
import { RecommendModule } from './recommend/recommend.module';
import { CryptoModule } from './crypto/crypto.module';
import { RfidModule } from './rfid/rfid.module';
import { PcRecoveryModule } from './pc-recovery/pc-recovery.module';
import { DiscordModule } from './discord/discord.module';
import { WifiVoucherModule } from './wifi-voucher/wifi-voucher.module';
import { GeoModule } from './geo/geo.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { VoiceModule } from './voice/voice.module';
import { EnvMonitorModule } from './env-monitor/env-monitor.module';
import { AntiCheatModule } from './anti-cheat/anti-cheat.module';
import { ReplayModule } from './replay/replay.module';
import { InternetMgmtModule } from './internet-mgmt/internet-mgmt.module';
import { GamePlatformModule } from './game-platform/game-platform.module';
import { DynamicPromoModule } from './dynamic-promo/dynamic-promo.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { PredictiveMaintModule } from './predictive-maint/predictive-maint.module';
import { WhiteLabelModule } from './white-label/white-label.module';
import { SelfHealingModule } from './self-healing/self-healing.module';
import { AutoBillingModule } from './auto-billing/auto-billing.module';
import { QueueOptimizerModule } from './queue-optimizer/queue-optimizer.module';
import { SmartEnergyModule } from './smart-energy/smart-energy.module';
import { MetricsModule } from './metrics/metrics.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { WhatsAppBotModule } from './whatsapp-bot/whatsapp-bot.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ConfigModule,
    PrismaModule,
    AuthModule,
    BillingModule,
    UnitModule,
    MemberModule,
    PaymentModule,
    BookingModule,
    ShiftModule,
    PromoModule,
    TournamentModule,
    InventoryModule,
    NotificationModule,
    AnalyticsModule,
    ReportModule,
    SocketModule,
    AgentModule,
    WebhookModule,
    EmployeeModule,
    AssetModule,
    GamificationModule,
    VoucherModule,
    QueueModule,
    PrinterModule,
    DynamicPricingModule,
    SmartRulesModule,
    EventModule,
    PublicApiModule,
    BackupModule,
    SyncModule,
    CafeOrderModule,
    LeagueModule,
    MarketplaceModule,
    IotModule,
    RecommendModule,
    CryptoModule,
    RfidModule,
    PcRecoveryModule,
    DiscordModule,
    WifiVoucherModule,
    GeoModule,
    ChatbotModule,
    VoiceModule,
    EnvMonitorModule,
    AntiCheatModule,
    ReplayModule,
    InternetMgmtModule,
    GamePlatformModule,
    DynamicPromoModule,
    BlockchainModule,
    PredictiveMaintModule,
    WhiteLabelModule,
    SelfHealingModule,
    AutoBillingModule,
    QueueOptimizerModule,
    SmartEnergyModule,
    MetricsModule,
    TelegramBotModule,
    WhatsAppBotModule,
  ],
})
export class AppModule {}
