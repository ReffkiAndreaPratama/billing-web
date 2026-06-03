import { Injectable } from '@nestjs/common';

export interface CryptoPayment { id: string; amount: number; currency: 'BTC' | 'USDT' | 'ETH'; address: string; qrCode: string; status: 'PENDING' | 'CONFIRMED' | 'EXPIRED'; expiresAt: Date; }

@Injectable()
export class CryptoService {
  private payments: CryptoPayment[] = [];
  private rates = { BTC: 950000000, USDT: 16000, ETH: 45000000 };

  getRates() { return this.rates; }

  createPayment(amountIdr: number, currency: 'BTC' | 'USDT' | 'ETH'): CryptoPayment {
    const rate = this.rates[currency];
    const cryptoAmount = amountIdr / rate;
    const addresses = {
      BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      USDT: 'TXoVxiy8dQq3SVmWZh3MfJ3vKnbPfMYnFb',
      ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
    };
    const payment: CryptoPayment = {
      id: `crypto-${Date.now()}`,
      amount: parseFloat(cryptoAmount.toFixed(6)),
      currency,
      address: addresses[currency],
      qrCode: `${currency.toLowerCase()}:${addresses[currency]}?amount=${cryptoAmount.toFixed(6)}`,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
    this.payments.push(payment);

    // Simulate confirmation after 30s
    setTimeout(() => {
      const p = this.payments.find(pm => pm.id === payment.id);
      if (p && p.status === 'PENDING') p.status = 'CONFIRMED';
    }, 30000);

    return payment;
  }

  getPayments(): CryptoPayment[] { return this.payments; }

  checkStatus(id: string): CryptoPayment | undefined {
    return this.payments.find(p => p.id === id);
  }
}
