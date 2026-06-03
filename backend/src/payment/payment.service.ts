import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface PaymentGateway {
  name: 'MIDTRANS' | 'XENDIT' | 'DUITKU';
  active: boolean;
  merchantId: string;
}

export interface SnapTransaction {
  token: string;
  redirectUrl: string;
}

export interface XenditInvoice {
  id: string;
  invoiceUrl: string;
  expiryDate: Date;
}

export interface DuitkuTransaction {
  reference: string;
  paymentUrl: string;
  expiry: Date;
}

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  private gateways: PaymentGateway[] = [
    { name: 'MIDTRANS', active: true, merchantId: 'G12345' },
    { name: 'XENDIT', active: true, merchantId: 'xnd_abc123' },
    { name: 'DUITKU', active: true, merchantId: 'D12345' },
  ];

  getGateways() { return this.gateways; }

  async createPayment(data: {
    billingId: string; amount: number;
    method: 'CASH' | 'QRIS' | 'VA' | 'TRANSFER' | 'WALLET' | 'CRYPTO';
    memberId?: string; userId: string; branchId?: string;
  }) {
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const transaction = await this.prisma.transaction.create({
      data: {
        invoiceNumber, type: 'BILLING', amount: data.amount,
        paymentMethod: data.method as any, paymentStatus: data.method === 'CASH' ? 'PAID' : 'PENDING',
        billingId: data.billingId, memberId: data.memberId,
        userId: data.userId, branchId: data.branchId,
      },
    });
    return transaction;
  }

  // ─── MIDTRANS SNAP ──────────────────────────
  async midtransSnap(amount: number, invoiceNumber: string, customer: { email?: string; name?: string; phone?: string }) {
    const token = `snap-${crypto.randomBytes(16).toString('hex')}`;
    const redirectUrl = `https://app.midtrans.com/snap/v3/redirection/${token}`;
    return { token, redirectUrl, invoiceNumber, amount, expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) } as SnapTransaction;
  }

  // ─── MIDTRANS CORE API (VT-Web) ────────────
  async midtransVA(amount: number, invoiceNumber: string, bank: 'BCA' | 'BNI' | 'MANDIRI' | 'PERMATA' | 'BRI') {
    const vaNumber = `70${bank === 'BCA' ? '0' : bank === 'BNI' ? '1' : bank === 'MANDIRI' ? '2' : bank === 'BRI' ? '3' : '4'}${Date.now().toString().slice(-12)}`;
    return { bank, vaNumber, invoiceNumber, amount, expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) };
  }

  // ─── XENDIT INVOICE ─────────────────────────
  async xenditInvoice(amount: number, invoiceNumber: string, customer: { email?: string; name?: string }) {
    const id = `xnd-inv-${crypto.randomBytes(8).toString('hex')}`;
    const invoiceUrl = `https://invoice.xendit.co/${id}`;
    return { id, invoiceUrl, invoiceNumber, amount, expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), customer } as XenditInvoice;
  }

  // ─── XENDIT QRIS ────────────────────────────
  async xenditQRIS(amount: number, invoiceNumber: string) {
    const id = `xnd-qris-${crypto.randomBytes(6).toString('hex')}`;
    const qrString = `${id}|${amount}|${invoiceNumber}`;
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
    return { id, qrString, qrImage, invoiceNumber, amount, expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) };
  }

  // ─── XENDIT EWALLET ─────────────────────────
  async xenditEWallet(amount: number, invoiceNumber: string, ewalletType: 'OVO' | 'DANA' | 'LINKAJA' | 'SHOPEEPAY') {
    const id = `xnd-ew-${crypto.randomBytes(6).toString('hex')}`;
    return { id, ewalletType, invoiceNumber, amount, checkoutUrl: `https://checkout.xendit.co/${id}`, expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) };
  }

  // ─── DUITKU ─────────────────────────────────
  async duitkuPayment(amount: number, invoiceNumber: string, customer: { email: string; name: string; phone: string }) {
    const reference = `REF-${Date.now()}`;
    const paymentUrl = `https://payment.duitku.com/${reference}`;
    return { reference, paymentUrl, invoiceNumber, amount, expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) } as DuitkuTransaction;
  }

  // ─── GENERATE QRIS (auto route gateway) ─────
  async generateQRIS(amount: number, invoiceNumber: string) {
    return this.xenditQRIS(amount, invoiceNumber);
  }

  // ─── GENERATE VA (auto route) ──────────────
  async generateVA(amount: number, invoiceNumber: string, bank: string) {
    if (['BCA', 'BNI', 'MANDIRI', 'PERMATA', 'BRI'].includes(bank)) return this.midtransVA(amount, invoiceNumber, bank as any);
    return this.midtransVA(amount, invoiceNumber, 'BCA');
  }

  // ─── WEBHOOK: MIDTRANS ──────────────────────
  async processMidtransWebhook(payload: any) {
    const { order_id, transaction_status, gross_amount, payment_type } = payload;
    const transaction = await this.prisma.transaction.findFirst({ where: { invoiceNumber: order_id }, include: { billing: true } });
    if (!transaction) throw new Error(`Transaction ${order_id} not found`);
    const statusMap: Record<string, string> = {
      capture: 'PAID', settlement: 'PAID', pending: 'PENDING',
      deny: 'FAILED', cancel: 'CANCELLED', expire: 'EXPIRED', refund: 'REFUNDED',
    };
    const newStatus = (statusMap[transaction_status] || 'PENDING') as any;
    await this.prisma.transaction.update({ where: { id: transaction.id }, data: { paymentStatus: newStatus } });
    return { invoiceNumber: order_id, status: newStatus, gateway: 'MIDTRANS' };
  }

  // ─── WEBHOOK: XENDIT ─────────────────────────
  async processXenditWebhook(payload: any) {
    const { id, external_id, status, paid_amount } = payload;
    const transaction = await this.prisma.transaction.findFirst({ where: { invoiceNumber: external_id } });
    if (!transaction) throw new Error(`Transaction ${external_id} not found`);
    const statusMap: Record<string, string> = {
      PAID: 'PAID', SETTLED: 'PAID', PENDING: 'PENDING',
      FAILED: 'FAILED', EXPIRED: 'EXPIRED',
    };
    const newStatus = (statusMap[status] || 'PENDING') as any;
    await this.prisma.transaction.update({ where: { id: transaction.id }, data: { paymentStatus: newStatus } });
    return { invoiceNumber: external_id, status: newStatus, gateway: 'XENDIT' };
  }

  // ─── WEBHOOK: DUITKU ─────────────────────────
  async processDuitkuWebhook(payload: any) {
    const { merchantOrderId, statusCode } = payload;
    const transaction = await this.prisma.transaction.findFirst({ where: { invoiceNumber: merchantOrderId } });
    if (!transaction) throw new Error(`Transaction ${merchantOrderId} not found`);
    const statusMap: Record<string, string> = {
      '00': 'PAID', '01': 'PENDING', '02': 'FAILED', '03': 'EXPIRED',
    };
    const newStatus = (statusMap[statusCode] || 'PENDING') as any;
    await this.prisma.transaction.update({ where: { id: transaction.id }, data: { paymentStatus: newStatus } });
    return { invoiceNumber: merchantOrderId, status: newStatus, gateway: 'DUITKU' };
  }

  // ─── TRANSACTION HISTORY ─────────────────────
  async getHistory(page: number = 1, limit: number = 20) {
    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { billing: true, member: true, user: true },
      }),
      this.prisma.transaction.count(),
    ]);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getDailySummary(date?: string) {
    const d = date ? new Date(date) : new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start.getTime() + 86400000);
    const transactions = await this.prisma.transaction.findMany({ where: { createdAt: { gte: start, lt: end } } });
    return {
      date: start.toISOString().slice(0, 10),
      totalTransactions: transactions.length,
      totalRevenue: transactions.filter(t => t.paymentStatus === 'PAID').reduce((s, t) => s + Number(t.amount), 0),
      byMethod: transactions.reduce((acc: Record<string, number>, t) => {
        if (t.paymentStatus === 'PAID' && t.paymentMethod) acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + Number(t.amount);
        return acc;
      }, {}),
    };
  }
}
