import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { WifiVoucherService } from './wifi-voucher.service';

@Controller('wifi-voucher')
export class WifiVoucherController {
  constructor(private wv: WifiVoucherService) {}

  @Post('generate') generate(@Body() dto: { durationHours: number; price: number; count: number }) { return this.wv.generate(dto.durationHours, dto.price, dto.count); }
  @Post('validate') validate(@Body('code') code: string) { return this.wv.validate(code); }
  @Get('list') list() { return this.wv.list(); }
  @Get('mikrotik/:code') mikrotik(@Param('code') code: string) { return { script: this.wv.mikrotikExport(code) }; }
}
