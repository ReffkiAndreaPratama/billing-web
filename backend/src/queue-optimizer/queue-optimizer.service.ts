import { Injectable } from '@nestjs/common';

export interface Optimization { queueId: string; customerName: string; partySize: number; preferredUnitType: string; suggestedUnit: string; waitTimeMinutes: number; reason: string; }

@Injectable()
export class QueueOptimizerService {
  private queue: { id: string; name: string; size: number; prefType: string; }[] = [];

  addToQueue(name: string, size: number, prefType: string) {
    const entry = { id: `qopt-${Date.now()}`, name, size, prefType };
    this.queue.push(entry);
    return entry;
  }

  optimize(): Optimization[] {
    const unitTypes = ['PC Regular', 'PC VIP', 'PS5', 'Room VIP'];
    return this.queue.map((q, i) => {
      const unitType = q.prefType || unitTypes[i % unitTypes.length];
      const waitTime = i * 5 + 10;
      return {
        queueId: q.id, customerName: q.name, partySize: q.size,
        preferredUnitType: unitType,
        suggestedUnit: `Unit ${String.fromCharCode(65 + i)}`,
        waitTimeMinutes: waitTime,
        reason: waitTime < 15 ? 'Slot tersedia, arahkan sekarang' : 'Antrian, estimasi sesuai prioritas member',
      };
    });
  }

  getQueue() { return this.queue; }
  removeFromQueue(id: string) { this.queue = this.queue.filter(q => q.id !== id); }
}
