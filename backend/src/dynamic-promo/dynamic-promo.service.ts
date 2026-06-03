import { Injectable } from '@nestjs/common';

@Injectable()
export class DynamicPromoService {
  generatePromo(occupancy: number, hour: number): { name: string; discount: number; reason: string; active: boolean } {
    if (occupancy < 30) return { name: 'Sepi Banget!', discount: 30, reason: `Okupansi ${occupancy}% — Diskon besar!`, active: true };
    if (occupancy < 50) return { name: 'Happy Hour', discount: 15, reason: `Okupansi ${occupancy}% — Diskon siang`, active: true };
    if (occupancy > 85) return { name: 'Premium Time', discount: 0, reason: `Okupansi ${occupancy}% — Harga normal premium`, active: false };
    return { name: 'Regular', discount: 5, reason: `Okupansi ${occupancy}% — Diskon kecil`, active: true };
  }

  getActivePromos(): any[] {
    const h = new Date().getHours();
    const day = new Date().getDay();
    const promos: any[] = [];
    if (h >= 22 || h < 6) promos.push({ name: 'Midnight Madness', discount: 30, reason: 'Jam malam, diskon 30%', active: true });
    if (day === 6 || day === 0) promos.push({ name: 'Weekend Spesial', discount: 20, reason: 'Weekend, free minum!', active: true });
    promos.push({ name: 'Member Gold', discount: 15, reason: 'Diskon loyalitas member', active: true });
    return promos;
  }
}
