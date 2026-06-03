import { Injectable } from '@nestjs/common';

export interface Recording { id: string; sessionId: string; unitId: string; unitName: string; startTime: Date; endTime?: Date; status: 'RECORDING' | 'STOPPED' | 'SAVED'; fileUrl?: string; duration?: number; }

@Injectable()
export class ReplayService {
  private recordings: Recording[] = [];

  start(sessionId: string, unitId: string, unitName: string): Recording {
    const rec: Recording = { id: `rec-${Date.now()}`, sessionId, unitId, unitName, startTime: new Date(), status: 'RECORDING' };
    this.recordings.push(rec);
    return rec;
  }

  stop(id: string): Recording | null {
    const rec = this.recordings.find(r => r.id === id);
    if (rec) {
      rec.status = 'STOPPED';
      rec.endTime = new Date();
      rec.duration = Math.floor((rec.endTime.getTime() - rec.startTime.getTime()) / 1000);
      rec.fileUrl = `/replays/${rec.id}.mp4`;
      return rec;
    }
    return null;
  }

  save(id: string): Recording | null {
    const rec = this.recordings.find(r => r.id === id);
    if (rec) { rec.status = 'SAVED'; return rec; }
    return null;
  }

  list(sessionId?: string): Recording[] {
    return sessionId ? this.recordings.filter(r => r.sessionId === sessionId) : this.recordings;
  }
}
