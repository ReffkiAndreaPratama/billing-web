import { Module } from '@nestjs/common';
import { DynamicPromoService } from './dynamic-promo.service';
import { DynamicPromoController } from './dynamic-promo.controller';
@Module({ controllers: [DynamicPromoController], providers: [DynamicPromoService], exports: [DynamicPromoService] })
export class DynamicPromoModule {}
