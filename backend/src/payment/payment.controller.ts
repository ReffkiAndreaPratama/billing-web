import { Controller, Post, Get, Param, Query, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private payment: PaymentService) {}

  @Get('gateways')
  @UseGuards(JwtAuthGuard)
  gateways() { return this.payment.getGateways(); }

  @Post('pay')
  @UseGuards(JwtAuthGuard)
  pay(@Body() dto: { billingId: string; amount: number; method: string; memberId?: string; branchId?: string }, @CurrentUser('id') userId: string) {
    return this.payment.createPayment({ ...dto, method: dto.method as any, userId });
  }

  @Post('qris')
  @UseGuards(JwtAuthGuard)
  qris(@Body() dto: { amount: number; invoiceNumber: string }) {
    return this.payment.generateQRIS(dto.amount, dto.invoiceNumber);
  }

  @Post('va')
  @UseGuards(JwtAuthGuard)
  va(@Body() dto: { amount: number; invoiceNumber: string; bank: string }) {
    return this.payment.generateVA(dto.amount, dto.invoiceNumber, dto.bank);
  }

  @Post('midtrans/snap')
  @UseGuards(JwtAuthGuard)
  midtransSnap(@Body() dto: { amount: number; invoiceNumber: string; email?: string; name?: string; phone?: string }) {
    return this.payment.midtransSnap(dto.amount, dto.invoiceNumber, { email: dto.email, name: dto.name, phone: dto.phone });
  }

  @Post('midtrans/va')
  @UseGuards(JwtAuthGuard)
  midtransVA(@Body() dto: { amount: number; invoiceNumber: string; bank: string }) {
    return this.payment.midtransVA(dto.amount, dto.invoiceNumber, dto.bank as any);
  }

  @Post('xendit/invoice')
  @UseGuards(JwtAuthGuard)
  xenditInvoice(@Body() dto: { amount: number; invoiceNumber: string; email?: string; name?: string }) {
    return this.payment.xenditInvoice(dto.amount, dto.invoiceNumber, { email: dto.email, name: dto.name });
  }

  @Post('xendit/qris')
  @UseGuards(JwtAuthGuard)
  xenditQRIS(@Body() dto: { amount: number; invoiceNumber: string }) {
    return this.payment.xenditQRIS(dto.amount, dto.invoiceNumber);
  }

  @Post('xendit/ewallet')
  @UseGuards(JwtAuthGuard)
  xenditEWallet(@Body() dto: { amount: number; invoiceNumber: string; ewalletType: string }) {
    return this.payment.xenditEWallet(dto.amount, dto.invoiceNumber, dto.ewalletType as any);
  }

  @Post('duitku')
  @UseGuards(JwtAuthGuard)
  duitku(@Body() dto: { amount: number; invoiceNumber: string; email: string; name: string; phone: string }) {
    return this.payment.duitkuPayment(dto.amount, dto.invoiceNumber, dto);
  }

  @Post('webhook/midtrans')
  midtransWebhook(@Body() body: any) { return this.payment.processMidtransWebhook(body); }

  @Post('webhook/xendit')
  xenditWebhook(@Body() body: any) { return this.payment.processXenditWebhook(body); }

  @Post('webhook/duitku')
  duitkuWebhook(@Body() body: any) { return this.payment.processDuitkuWebhook(body); }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  history(@Query('page') page: string, @Query('limit') limit: string) {
    return this.payment.getHistory(Number(page) || 1, Number(limit) || 20);
  }

  @Get('daily-summary')
  @UseGuards(JwtAuthGuard)
  dailySummary(@Query('date') date?: string) {
    return this.payment.getDailySummary(date);
  }
}
