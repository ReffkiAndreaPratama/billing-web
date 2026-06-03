import { Injectable } from '@nestjs/common';

export interface EnergyStats { unitId: string; status: 'ACTIVE' | 'IDLE' | 'SLEEP'; powerWatts: number; idleMinutes: number; estimatedCostPerDay: number; }

@Injectable()
export class SmartEnergyService {
  private units: EnergyStats[] = [
    { unitId: 'unit-1', status: 'ACTIVE', powerWatts: 250, idleMinutes: 0, estimatedCostPerDay: 6000 },
    { unitId: 'unit-2', status: 'IDLE', powerWatts: 120, idleMinutes: 15, estimatedCostPerDay: 2880 },
    { unitId: 'unit-3', status: 'IDLE', powerWatts: 120, idleMinutes: 45, estimatedCostPerDay: 2880 },
    { unitId: 'unit-4', status: 'ACTIVE', powerWatts: 350, idleMinutes: 0, estimatedCostPerDay: 8400 },
    { unitId: 'unit-5', status: 'SLEEP', powerWatts: 5, idleMinutes: 120, estimatedCostPerDay: 120 },
  ];

  getStats(): EnergyStats[] { return this.units; }
  getTotalPower(): number { return this.units.reduce((s, u) => s + u.powerWatts, 0); }
  getTotalCost(): number { return this.units.reduce((s, u) => s + u.estimatedCostPerDay, 0); }

  autoSleep(unitId: string): EnergyStats | null {
    const unit = this.units.find(u => u.unitId === unitId);
    if (unit && unit.status !== 'SLEEP') { unit.status = 'SLEEP'; unit.powerWatts = 5; return unit; }
    return null;
  }

  wake(unitId: string): EnergyStats | null {
    const unit = this.units.find(u => u.unitId === unitId);
    if (unit && unit.status === 'SLEEP') { unit.status = 'ACTIVE'; unit.powerWatts = 250; unit.idleMinutes = 0; return unit; }
    return null;
  }

  sleepAllIdle(thresholdMinutes: number): EnergyStats[] {
    return this.units.filter(u => u.status === 'IDLE' && u.idleMinutes >= thresholdMinutes).map(u => { u.status = 'SLEEP'; u.powerWatts = 5; return u; });
  }

  savings(): { currentDaily: number; optimizedDaily: number; monthlySavings: number } {
    return { currentDaily: this.getTotalCost(), optimizedDaily: 15000, monthlySavings: (this.getTotalCost() - 15000) * 30 };
  }
}
