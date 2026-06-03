import { Module } from '@nestjs/common';
import { WifiVoucherService } from './wifi-voucher.service';
import { WifiVoucherController } from './wifi-voucher.controller';

@Module({ controllers: [WifiVoucherController], providers: [WifiVoucherService], exports: [WifiVoucherService] })
export class WifiVoucherModule {}
