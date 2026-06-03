import { Injectable } from '@nestjs/common';

export interface PackageRecommendation { packageId: string; name: string; reason: string; discount?: number; }

@Injectable()
export class RecommendService {
  private memberHistory: Map<string, string[]> = new Map();

  recordHistory(memberId: string, packageName: string) {
    const history = this.memberHistory.get(memberId) || [];
    history.push(packageName);
    if (history.length > 20) history.shift();
    this.memberHistory.set(memberId, history);
  }

  getRecommendations(memberId?: string, hour?: number): PackageRecommendation[] {
    const h = hour ?? new Date().getHours();
    const isLateNight = h >= 22 || h < 6;
    const isEvening = h >= 18;
    const isAfternoon = h >= 12 && h < 18;
    const recs: PackageRecommendation[] = [];

    if (isLateNight) recs.push({ packageId: 'pkg-midnight', name: 'Midnight Package', reason: 'Cocok untuk jam malam, hemat 30%!', discount: 30 });
    else if (isEvening) recs.push({ packageId: 'pkg-2hour', name: '2 Hours Package', reason: 'Sore-sore main 2 jam, pas banget' });
    else if (isAfternoon) recs.push({ packageId: 'pkg-1hour', name: '1 Hour Package', reason: 'Siang singkat, 1 jam cukup' });

    if (memberId) {
      const history = this.memberHistory.get(memberId) || [];
      if (history.length > 0) recs.push({ packageId: 'pkg-repeat', name: history[history.length - 1], reason: 'Langganan favorit kamu' });
      recs.push({ packageId: 'pkg-unlimited', name: 'Unlimited Package', reason: 'Gold member? Main sepuasnya!', discount: 10 });
    }

    const day = new Date().getDay();
    if (day === 6 || day === 0) recs.push({ packageId: 'pkg-weekend', name: 'Weekend Package', reason: 'Weekend spesial, free snack!', discount: 15 });

    return recs.slice(0, 4);
  }

  getPeakHours() {
    return [
      { hour: 8, occupancy: 20, recommendation: 'Sepi, promo pagi 20%' },
      { hour: 10, occupancy: 40, recommendation: 'Mulai ramai, siapkan shift tambahan' },
      { hour: 14, occupancy: 60, recommendation: 'Cukup ramai' },
      { hour: 16, occupancy: 80, recommendation: 'Jam pulang sekolah, siapkan semua unit' },
      { hour: 18, occupancy: 90, recommendation: 'PRIME TIME! Harga premium aktif' },
      { hour: 20, occupancy: 95, recommendation: 'Puncak keramaian, aktifkan waiting list' },
      { hour: 22, occupancy: 70, recommendation: 'Midnight mulai, promo midnight aktif' },
      { hour: 23, occupancy: 50, recommendation: 'Mulai sepi, maintenance ringan' },
    ];
  }
}
