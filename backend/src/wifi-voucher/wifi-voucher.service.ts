import { Injectable } from '@nestjs/common';

export interface Voucher { code: string; durationHours: number; price: number; used: boolean; createdAt: Date; }

@Injectable()
export class WifiVoucherService {
  private vouchers: Voucher[] = [];

  generate(durationHours: number, price: number, count: number): Voucher[] {
    const generated: Voucher[] = [];
    for (let i = 0; i < count; i++) {
      const code = `WIFI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const v: Voucher = { code, durationHours, price, used: false, createdAt: new Date() };
      this.vouchers.push(v);
      generated.push(v);
    }
    return generated;
  }

  validate(code: string): Voucher | null {
    const v = this.vouchers.find(v => v.code === code && !v.used);
    if (v) { v.used = true; return v; }
    return null;
  }

  list(): Voucher[] { return this.vouchers; }

  mikrotikExport(code: string): string {
    return `/ip hotspot user add name=${code} password=${code} profile=1h comment="Voucher ${code}"`;
  }
}
