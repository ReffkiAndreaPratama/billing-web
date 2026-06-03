import { Module } from '@nestjs/common';
import { SmartEnergyService } from './smart-energy.service';
import { SmartEnergyController } from './smart-energy.controller';
@Module({ controllers: [SmartEnergyController], providers: [SmartEnergyService], exports: [SmartEnergyService] })
export class SmartEnergyModule {}
