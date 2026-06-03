import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';

@Controller('webhook')
export class WebhookController {
  constructor(private payment: PaymentService) {}

  @Post('midtrans')
  @HttpCode(200)
  async midtrans(@Body() payload: any) {
    try {
      return await this.payment.processMidtransWebhook(payload);
    } catch (err: any) {
      return { message: err.message };
    }
  }

  @Post('xendit')
  @HttpCode(200)
  async xendit(@Body() payload: any) {
    const orderId = payload.external_id;
    const status = payload.status === 'PAID' ? 'PAID' : 'FAILED';
    return { invoiceNumber: orderId, status };
  }

  @Post('duitku')
  @HttpCode(200)
  async duitku(@Body() payload: any) {
    const { merchantOrderId, resultCode } = payload;
    const status = resultCode === '00' ? 'PAID' : 'FAILED';
    return { invoiceNumber: merchantOrderId, status };
  }
}
