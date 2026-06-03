import { Injectable } from '@nestjs/common';

export interface ChatMessage { role: 'user' | 'bot'; message: string; timestamp: Date; }

@Injectable()
export class ChatbotService {
  private faq: { pattern: RegExp; answer: string }[] = [
    { pattern: /halo|hai|hi|pagi|siang|malam/i, answer: 'Halo! Ada yang bisa saya bantu? 😊' },
    { pattern: /harga|tarif|biaya|paket/i, answer: 'Harga mulai Rp5.000/jam untuk Regular, Rp10.000/jam untuk VIP. Cek menu Paket untuk detail!' },
    { pattern: /booking|reservasi|pesan/i, answer: 'Kamu bisa booking online melalui website atau langsung datang ke kasir.' },
    { pattern: /wifi|password|login/i, answer: 'WiFi: GameCenter / Password: gam3c3nt3r. Voucher WiFi bisa dibeli di kasir.' },
    { pattern: /member|daftar|registrasi/i, answer: 'Daftar member gratis! Dapatkan diskon 10% + loyalty points. Kunjungi kasir atau daftar online.' },
    { pattern: /jam|operasional|buka/i, answer: 'Kami buka setiap hari 08:00 - 00:00. Khusus weekend 24 jam!' },
    { pattern: /topup|saldo|isi/i, answer: 'Topup saldo member minimal Rp20.000. Bisa via QRIS, cash, atau transfer.' },
    { pattern: /lupa|password|akun/i, answer: 'Hubungi admin untuk reset password akun Anda.' },
    { pattern: /tournament|turnamen|lomba/i, answer: 'Lihat jadwal tournament terbaru di menu Tournament! Daftar sekarang juga.' },
    { pattern: /makan|minum|cafe|order/i, answer: 'Kamu bisa order makanan & minuman dari PC/unit melalui fitur Cafe Order!' },
  ];
  private history: ChatMessage[] = [];

  ask(question: string, sessionId: string): { answer: string; suggestions: string[] } {
    this.history.push({ role: 'user', message: question, timestamp: new Date() });
    const matched = this.faq.find(f => f.pattern.test(question));
    const answer = matched ? matched.answer : 'Maaf, saya belum paham pertanyaan itu. Silakan hubungi admin atau ketik "help" untuk bantuan.';
    this.history.push({ role: 'bot', message: answer, timestamp: new Date() });
    return {
      answer,
      suggestions: ['Cek harga paket', 'Cara booking', 'Info member', 'Jam operasional', 'Topup saldo'],
    };
  }

  getHistory(sessionId?: string): ChatMessage[] { return this.history; }

  getFaq(): { question: string; answer: string }[] {
    return this.faq.map(f => ({ question: f.pattern.source, answer: f.answer }));
  }
}
