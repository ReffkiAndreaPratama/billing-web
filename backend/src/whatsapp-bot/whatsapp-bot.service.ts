import { Injectable } from '@nestjs/common';

export interface Contact { phone: string; name: string; branchId: string; active: boolean; subscribed: Date; }

@Injectable()
export class WhatsAppBotService {
  private contacts: Contact[] = [];
  private autoReplies: Record<string, string> = {
    'halo': '👋 Halo! Ada yang bisa dibantu? Ketik *menu* untuk daftar layanan.',
    'menu': '*📋 Menu Billing Pro*\n1️⃣ Cek saldo\n2️⃣ Cek sisa waktu\n3️⃣ Booking unit\n4️⃣ Top up\n5️⃣ Laporan hari ini\nKetik angka untuk memilih.',
    '1': '💰 *Cek Saldo*\nSaldo Anda: Rp150,000\nMember: Member-1\nStatus: Aktif',
    '2': '⏱ *Sisa Waktu*\nUnit: PC-03\nSisa: 45 menit\nRate: Rp5,000/jam',
    '3': '📅 *Booking Unit*\nSilakan format: booking [unit] [jam_mulai]-[jam_selesai]\nContoh: booking PC-05 14:00-16:00',
    '4': '💳 *Top Up*\nSilakan format: topup [nominal]\nContoh: topup 50000',
    '5': '📊 *Laporan Hari Ini*\n• Pendapatan: Rp2,450,000\n• Sesi aktif: 8\n• Member baru: 3\n• Booking: 5',
  };

  getContacts() { return this.contacts; }
  getAutoReplies() { return this.autoReplies; }

  handleMessage(phone: string, text: string): string {
    const key = text.toLowerCase().trim();
    if (this.autoReplies[key]) return this.autoReplies[key];
    if (key.startsWith('booking')) return '✅ *Booking Berhasil!*\nUnit: PC-05\nJam: 14:00-16:00\nTotal: Rp10,000';
    if (key.startsWith('topup')) return '✅ *Top Up Berhasil!*\nRp50,000 ditambahkan\nSaldo: Rp200,000';
    return 'Maaf, perintah tidak dikenal. Ketik *menu* untuk melihat layanan.';
  }

  register(phone: string, name: string, branchId: string): Contact {
    const existing = this.contacts.find(c => c.phone === phone);
    if (existing) { existing.active = true; return existing; }
    const contact: Contact = { phone, name, branchId: branchId || 'main', active: true, subscribed: new Date() };
    this.contacts.push(contact);
    return contact;
  }

  broadcast(message: string): number {
    return this.contacts.filter(c => c.active).length;
  }
}
