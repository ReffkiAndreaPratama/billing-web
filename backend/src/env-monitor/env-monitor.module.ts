import { Module } from '@nestjs/common';
import { EnvMonitorService } from './env-monitor.service';
import { EnvMonitorController } from './env-monitor.controller';

@Module({ controllers: [EnvMonitorController], providers: [EnvMonitorService], exports: [EnvMonitorService] })
export class EnvMonitorModule {}
