import { Injectable } from '@nestjs/common';

export interface RfidCard { uid: string; memberId: string; memberName: string; status: 'ACTIVE' | 'INACTIVE'; registeredAt: Date; }

@Injectable()
export class RfidService {
  private cards: RfidCard[] = [
    { uid: 'RFID-001', memberId: 'mem-1', memberName: 'Budi', status: 'ACTIVE', registeredAt: new Date() },
    { uid: 'RFID-002', memberId: 'mem-2', memberName: 'Ani', status: 'ACTIVE', registeredAt: new Date() },
  ];

  getCards(): RfidCard[] { return this.cards; }

  tap(uid: string): { memberId: string; memberName: string; unitId?: string } | null {
    const card = this.cards.find(c => c.uid === uid && c.status === 'ACTIVE');
    if (!card) return null;
    return { memberId: card.memberId, memberName: card.memberName, unitId: `unit-${Math.floor(Math.random() * 10) + 1}` };
  }

  register(uid: string, memberId: string, memberName: string): RfidCard {
    const card: RfidCard = { uid, memberId, memberName, status: 'ACTIVE', registeredAt: new Date() };
    this.cards.push(card);
    return card;
  }

  toggle(uid: string): RfidCard | null {
    const card = this.cards.find(c => c.uid === uid);
    if (card) { card.status = card.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'; return card; }
    return null;
  }
}
