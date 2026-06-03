import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('crypto')
@UseGuards(JwtAuthGuard)
export class CryptoController {
  constructor(private crypto: CryptoService) {}

  @Get('rates') getRates() { return this.crypto.getRates(); }

  @Post('payment')
  createPayment(@Body() dto: { amount: number; currency: 'BTC' | 'USDT' | 'ETH' }) {
    return this.crypto.createPayment(dto.amount, dto.currency);
  }

  @Get('payments') getPayments() { return this.crypto.getPayments(); }

  @Get('payment/:id') checkStatus(@Param('id') id: string) { return this.crypto.checkStatus(id); }
}
