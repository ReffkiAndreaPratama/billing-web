import { Injectable } from '@nestjs/common';

export interface Subscriber { chatId: string; username: string; branchId: string; active: boolean; }

@Injectable()
export class TelegramBotService {
  private subscribers: Subscriber[] = [];
  private commandPatterns: Record<string, { desc: string; reply: string }> = {
    '/start': { desc: 'Memulai bot', reply: '🤖 Selamat datang di Billing Pro Bot!\nGunakan /help untuk daftar perintah.' },
    '/help': { desc: 'Daftar perintah', reply: '/cek_saldo - Cek saldo member\n/cek_sisa_waktu - Cek sisa waktu billing\n/booking <unit> <jam> - Booking unit\n/topup <nominal> - Top up saldo\n/laporan - Laporan singkat hari ini' },
    '/cek_saldo': { desc: 'Cek saldo member', reply: '💰 Saldo Anda: Rp150,000\nMember: Member-1\nStatus: Active' },
    '/cek_sisa_waktu': { desc: 'Cek sisa waktu', reply: '⏱ Sisa waktu: 45 menit\nUnit: PC-03\nRate: Rp5,000/jam' },
    '/laporan': { desc: 'Laporan hari ini', reply: '📊 Laporan Hari Ini:\n• Pendapatan: Rp2,450,000\n• Sesi aktif: 8\n• Member baru: 3\n• Booking: 5' },
  };

  getCommands() { return this.commandPatterns; }
  getSubscribers() { return this.subscribers; }

  handleMessage(chatId: string, text: string): string {
    const cmd = text.split(' ')[0].toLowerCase();
    if (this.commandPatterns[cmd]) return this.commandPatterns[cmd].reply;
    if (text.startsWith('/booking')) return '✅ Booking berhasil!\nUnit: PC-05\nJam: 14:00-16:00\nTotal: Rp10,000';
    if (text.startsWith('/topup')) return '💳 Top up berhasil!\nRp50,000 ditambahkan ke saldo Anda.\nSaldo: Rp200,000';
    return `Perintah tidak dikenal. Ketik /help untuk bantuan.`;
  }

  subscribe(chatId: string, username: string, branchId: string): Subscriber {
    const existing = this.subscribers.find(s => s.chatId === chatId);
    if (existing) { existing.active = true; return existing; }
    const sub: Subscriber = { chatId, username, branchId, active: true };
    this.subscribers.push(sub);
    return sub;
  }

  unsubscribe(chatId: string) {
    const sub = this.subscribers.find(s => s.chatId === chatId);
    if (sub) sub.active = false;
  }

  broadcast(message: string): number {
    let count = 0;
    for (const sub of this.subscribers) {
      if (sub.active) count++;
    }
    return count;
  }
}
