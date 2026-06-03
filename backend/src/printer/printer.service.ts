import { Injectable } from '@nestjs/common';

@Injectable()
export class PrinterService {
  generateReceipt(data: {
    invoiceNumber: string;
    date: Date;
    cashier: string;
    customer: string;
    items: { name: string; qty: number; price: number }[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    paid: number;
    change: number;
  }): string {
    const line = '-'.repeat(42);
    const header = [
      line,
      '              GAME CENTER',
      '          Billing & Rental System',
      '          Jl. Gaming No. 1, Jakarta',
      '          Telp: 021-12345678',
      line,
      `  Invoice  : ${data.invoiceNumber}`,
      `  Date     : ${data.date.toLocaleDateString()} ${data.date.toLocaleTimeString()}`,
      `  Cashier  : ${data.cashier}`,
      `  Customer : ${data.customer}`,
      line,
      '  Item                    Qty    Price',
      line,
    ];

    const items = data.items.map(i => {
      const name = i.name.padEnd(22).slice(0, 22);
      const qty = String(i.qty).padStart(3);
      const price = String(Math.round(i.price)).padStart(10);
      return `  ${name} ${qty} ${price}`;
    });

    const footer = [
      line,
      `  Subtotal          : ${String(Math.round(data.subtotal)).padStart(10)}`,
      `  Discount          : ${String(Math.round(data.discount)).padStart(10)}`,
      `  Tax (11%)        : ${String(Math.round(data.tax)).padStart(10)}`,
      `  TOTAL             : ${String(Math.round(data.total)).padStart(10)}`,
      line,
      `  Payment           : ${data.paymentMethod.padEnd(10)} ${String(Math.round(data.paid)).padStart(10)}`,
      `  Change            : ${String(Math.round(data.change)).padStart(10)}`,
      line,
      '',
      '         Terima Kasih atas Kunjungan Anda',
      '              ~ Selamat Bermain ~',
      '',
      line,
      '',
    ];

    return [...header, ...items, ...footer].join('\n');
  }

  generateBillingReceipt(session: any, transaction: any): string {
    return this.generateReceipt({
      invoiceNumber: transaction.invoiceNumber,
      date: new Date(),
      cashier: transaction.user?.name || 'System',
      customer: session.member?.name || 'Walk-in',
      items: [
        { name: `${session.unit?.name} (${session.unit?.type})`, qty: 1, price: session.totalCost },
        ...(session.overtimeCost > 0 ? [{ name: 'Overtime', qty: 1, price: session.overtimeCost }] : []),
      ],
      subtotal: session.totalCost,
      discount: 0,
      tax: 0,
      total: session.totalCost,
      paymentMethod: transaction.paymentMethod || 'CASH',
      paid: transaction.amount || session.totalCost,
      change: (transaction.amount || session.totalCost) - session.totalCost,
    });
  }

  escpos(data: { type: 'receipt' | 'billing'; content: any }): Buffer {
    const text = data.type === 'receipt'
      ? this.generateReceipt(data.content)
      : this.generateBillingReceipt(data.content.session, data.content.transaction);

    const encoder = new TextEncoder();
    const raw = encoder.encode(text);

    // ESC/POS commands
    const INIT = Buffer.from([0x1b, 0x40]);           // Initialize printer
    const CENTER = Buffer.from([0x1b, 0x61, 0x01]);   // Center align
    const LEFT = Buffer.from([0x1b, 0x61, 0x00]);     // Left align
    const BOLD_ON = Buffer.from([0x1b, 0x45, 0x01]);  // Bold on
    const BOLD_OFF = Buffer.from([0x1b, 0x45, 0x00]); // Bold off
    const CUT = Buffer.from([0x1d, 0x56, 0x00]);      // Cut paper
    const LINE_FEED = Buffer.from([0x0a]);

    return Buffer.concat([
      INIT,
      CENTER,
      BOLD_ON,
      encoder.encode('GAME CENTER\n'),
      BOLD_OFF,
      LEFT,
      Buffer.from(raw),
      LINE_FEED,
      LINE_FEED,
      LINE_FEED,
      CUT,
    ]);
  }
}
