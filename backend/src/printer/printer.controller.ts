import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('printer')
@UseGuards(JwtAuthGuard)
export class PrinterController {
  constructor(private printer: PrinterService) {}

  @Post('receipt')
  generateReceipt(@Body() dto: any) {
    const text = this.printer.generateReceipt(dto);
    return { text, lines: text.split('\n').length };
  }

  @Post('escpos')
  generateEscpos(@Body() dto: { type: 'receipt' | 'billing'; content: any }) {
    const buf = this.printer.escpos(dto);
    return { length: buf.length, type: 'escpos' };
  }
}
