import { Injectable } from '@nestjs/common';

export interface Command { pattern: RegExp; action: string; response: string; }

@Injectable()
export class VoiceService {
  private commands: Command[] = [
    { pattern: /buka billing (pc|ps|unit) (\d+)/i, action: 'OPEN_BILLING', response: 'Membuka billing unit $1 $2' },
    { pattern: /tutup billing (pc|ps|unit) (\d+)/i, action: 'CLOSE_BILLING', response: 'Menutup billing unit $1 $2' },
    { pattern: /omzet (hari ini|hari ini)/i, action: 'OMZET_HARI_INI', response: 'Omzet hari ini: Rp 2.500.000' },
    { pattern: /status unit/i, action: 'STATUS_UNIT', response: '10 unit aktif dari 20 total' },
    { pattern: /booking (masuk|baru)/i, action: 'BOOKING_CHECK', response: 'Ada 3 booking baru hari ini' },
    { pattern: /topup member/i, action: 'TOPUP_MEMBER', response: '10 topup pending hari ini' },
    { pattern: /help|bantuan/i, action: 'HELP', response: 'Perintah: buka billing, tutup billing, omzet, status unit, booking, topup' },
  ];

  process(transcript: string): { action: string; response: string; confidence: number } {
    const matched = this.commands.find(c => c.pattern.test(transcript));
    if (matched) return { action: matched.action, response: matched.response, confidence: 0.85 };
    return { action: 'UNKNOWN', response: 'Maaf, perintah tidak dikenali. Coba: "buka billing PC 1", "omzet hari ini", "status unit"', confidence: 0 };
  }

  getCommands(): Command[] { return this.commands; }
}
