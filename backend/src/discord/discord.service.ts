import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscordService {
  private webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
  private logs: { channel: string; message: string; timestamp: Date }[] = [];

  async send(channel: string, message: string): Promise<boolean> {
    this.logs.push({ channel, message, timestamp: new Date() });
    if (this.webhookUrl) {
      try {
        await fetch(this.webhookUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `[${channel}] ${message}` }),
        });
      } catch {}
    }
    return true;
  }

  getLogs(): any[] { return this.logs; }

  getCommands(): { command: string; description: string }[] {
    return [
      { command: '/omzet', description: 'Cek omzet hari ini' },
      { command: '/status', description: 'Status semua unit' },
      { command: '/cabang', description: 'Info cabang aktif' },
      { command: '/top', description: 'Top 5 member' },
      { command: '/billing', description: 'Billing aktif saat ini' },
    ];
  }
}
