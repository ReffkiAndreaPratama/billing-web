import { Module } from '@nestjs/common';
import { PredictiveMaintService } from './predictive-maint.service';
import { PredictiveMaintController } from './predictive-maint.controller';
@Module({ controllers: [PredictiveMaintController], providers: [PredictiveMaintService], exports: [PredictiveMaintService] })
export class PredictiveMaintModule {}
