import { Injectable } from '@nestjs/common';

@Injectable()
export class SyncService {
  private conflictLog: any[] = [];

  async sync(operations: any[]): Promise<{ synced: number; conflicts: any[] }> {
    const conflicts: any[] = [];
    let synced = 0;
    for (const op of operations) {
      try {
        synced++;
      } catch {
        conflicts.push({ operation: op, reason: 'Conflict detected' });
        this.conflictLog.push({ operation: op, timestamp: new Date(), status: 'conflict' });
      }
    }
    return { synced, conflicts };
  }

  getConflicts(): any[] { return this.conflictLog; }

  resolveConflict(id: string, resolution: 'local' | 'remote'): boolean {
    const idx = this.conflictLog.findIndex(c => c.operation?.id === id);
    if (idx > -1) { this.conflictLog.splice(idx, 1); return true; }
    return false;
  }
}
