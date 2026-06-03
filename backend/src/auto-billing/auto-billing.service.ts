import { Injectable } from '@nestjs/common';

export interface AutoSession { id: string; unitId: string; memberId: string; sessionId: string; status: 'PENDING' | 'ACTIVE' | 'ENDED'; startedAt?: Date; }

@Injectable()
export class AutoBillingService {
  private sessions: AutoSession[] = [];

  pcPowerOn(unitId: string, memberId: string): { session: AutoSession; autoStarted: boolean } {
    const existing = this.sessions.find(s => s.unitId === unitId && s.status === 'ACTIVE');
    if (existing) return { session: existing, autoStarted: false };
    const session: AutoSession = {
      id: `auto-${Date.now()}`, unitId, memberId: memberId || 'walk-in',
      sessionId: `sess-${Date.now()}`, status: 'PENDING', startedAt: new Date(),
    };
    this.sessions.push(session);
    setTimeout(() => { session.status = 'ACTIVE'; }, 3000);
    return { session, autoStarted: true };
  }

  pcPowerOff(unitId: string): AutoSession | null {
    const session = this.sessions.find(s => s.unitId === unitId && s.status === 'ACTIVE');
    if (session) { session.status = 'ENDED'; return session; }
    return null;
  }

  getActive(): AutoSession[] { return this.sessions.filter(s => s.status === 'ACTIVE'); }
  getHistory(): AutoSession[] { return this.sessions; }
}
