import { Injectable } from '@nestjs/common';

export interface Prediction { unitId: string; unitName: string; risk: 'LOW' | 'MEDIUM' | 'HIGH'; issue: string; probability: number; daysLeft: number; recommendation: string; }

@Injectable()
export class PredictiveMaintService {
  private predictions: Prediction[] = [
    { unitId: 'unit-1', unitName: 'PC-01', risk: 'HIGH', issue: 'HDD Bad Sector', probability: 0.82, daysLeft: 7, recommendation: 'Segera ganti HDD' },
    { unitId: 'unit-3', unitName: 'PC-03', risk: 'MEDIUM', issue: 'Thermal Paste Kering', probability: 0.55, daysLeft: 30, recommendation: 'Ganti thermal paste' },
    { unitId: 'unit-5', unitName: 'PS5-01', risk: 'MEDIUM', issue: 'Fan Berisik', probability: 0.45, daysLeft: 45, recommendation: 'Bersihkan fan' },
    { unitId: 'unit-8', unitName: 'PC-08', risk: 'LOW', issue: 'RAM Degradasi', probability: 0.15, daysLeft: 120, recommendation: 'Pantau performa' },
  ];

  getPredictions(): Prediction[] { return this.predictions; }
  getHighRisk(): Prediction[] { return this.predictions.filter(p => p.risk === 'HIGH'); }

  analyze(unitId: string, temperature: number, uptimeHours: number, diskHealth: number): Prediction {
    let risk: Prediction['risk'] = 'LOW';
    if (temperature > 80 || diskHealth < 30) risk = 'HIGH';
    else if (temperature > 65 || diskHealth < 60) risk = 'MEDIUM';
    return { unitId, unitName: unitId, risk, issue: diskHealth < 30 ? 'Disk failure imminent' : 'High temperature', probability: risk === 'HIGH' ? 0.85 : 0.4, daysLeft: risk === 'HIGH' ? 3 : 30, recommendation: risk === 'HIGH' ? 'Immediate maintenance required' : 'Schedule maintenance soon' };
  }
}
