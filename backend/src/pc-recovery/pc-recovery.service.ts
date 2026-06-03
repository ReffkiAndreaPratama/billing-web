import { Injectable } from '@nestjs/common';

export interface RecoveryLog { id: string; unitId: string; unitName: string; action: string; status: string; createdAt: Date; completedAt?: Date; }

@Injectable()
export class PcRecoveryService {
  private logs: RecoveryLog[] = [];

  restart(unitId: string, unitName: string): RecoveryLog {
    const log: RecoveryLog = { id: `rcv-${Date.now()}`, unitId, unitName, action: 'RESTART', status: 'EXECUTING', createdAt: new Date() };
    this.logs.push(log);
    setTimeout(() => { log.status = 'COMPLETED'; log.completedAt = new Date(); }, 5000);
    return log;
  }

  shutdown(unitId: string, unitName: string): RecoveryLog {
    const log: RecoveryLog = { id: `rcv-${Date.now()}`, unitId, unitName, action: 'SHUTDOWN', status: 'EXECUTING', createdAt: new Date() };
    this.logs.push(log);
    setTimeout(() => { log.status = 'COMPLETED'; log.completedAt = new Date(); }, 3000);
    return log;
  }

  reimage(unitId: string, unitName: string): RecoveryLog {
    const log: RecoveryLog = { id: `rcv-${Date.now()}`, unitId, unitName, action: 'REIMAGE', status: 'EXECUTING', createdAt: new Date() };
    this.logs.push(log);
    setTimeout(() => { log.status = 'COMPLETED'; log.completedAt = new Date(); }, 120000);
    return log;
  }

  getLogs(unitId?: string): RecoveryLog[] {
    return unitId ? this.logs.filter(l => l.unitId === unitId) : this.logs;
  }
}
