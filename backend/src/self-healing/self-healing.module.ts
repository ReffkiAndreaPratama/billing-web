import { Module } from '@nestjs/common';
import { SelfHealingService } from './self-healing.service';
import { SelfHealingController } from './self-healing.controller';
@Module({ controllers: [SelfHealingController], providers: [SelfHealingService], exports: [SelfHealingService] })
export class SelfHealingModule {}
