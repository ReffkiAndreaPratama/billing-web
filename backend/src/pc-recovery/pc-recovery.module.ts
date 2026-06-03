import { Module } from '@nestjs/common';
import { PcRecoveryService } from './pc-recovery.service';
import { PcRecoveryController } from './pc-recovery.controller';

@Module({ controllers: [PcRecoveryController], providers: [PcRecoveryService], exports: [PcRecoveryService] })
export class PcRecoveryModule {}
