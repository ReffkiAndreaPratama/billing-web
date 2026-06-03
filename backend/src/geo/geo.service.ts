import { Injectable } from '@nestjs/common';

export interface GeoEntry { city: string; region: string; count: number; percentage: number; }

@Injectable()
export class GeoService {
  private cities: GeoEntry[] = [
    { city: 'Jakarta', region: 'Jabodetabek', count: 2450, percentage: 28 },
    { city: 'Bandung', region: 'Jawa Barat', count: 1800, percentage: 20 },
    { city: 'Surabaya', region: 'Jawa Timur', count: 1500, percentage: 17 },
    { city: 'Medan', region: 'Sumatera', count: 900, percentage: 10 },
    { city: 'Makassar', region: 'Sulawesi', count: 700, percentage: 8 },
    { city: 'Yogyakarta', region: 'Jawa Tengah', count: 650, percentage: 7 },
    { city: 'Denpasar', region: 'Bali', count: 500, percentage: 6 },
    { city: 'Lainnya', region: 'Lainnya', count: 400, percentage: 4 },
  ];

  getCities(): GeoEntry[] { return this.cities; }

  getRegions(): { region: string; total: number }[] {
    const map = new Map<string, number>();
    this.cities.forEach(c => map.set(c.region, (map.get(c.region) || 0) + c.count));
    return Array.from(map.entries()).map(([region, total]) => ({ region, total }));
  }

  recordVisit(city: string, region: string) {
    const existing = this.cities.find(c => c.city === city);
    if (existing) existing.count++;
    else this.cities.push({ city, region, count: 1, percentage: 0 });
    const total = this.cities.reduce((s, c) => s + c.count, 0);
    this.cities.forEach(c => c.percentage = parseFloat(((c.count / total) * 100).toFixed(1)));
  }
}
