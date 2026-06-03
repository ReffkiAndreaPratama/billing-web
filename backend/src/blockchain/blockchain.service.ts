import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainService {
  private wallets: Record<string, { address: string; balance: number; transactions: any[] }> = {
    'member-1': { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', balance: 2500, transactions: [] },
    'member-2': { address: '0x1234...abcd', balance: 750, transactions: [] },
  };

  getWallet(memberId: string) { return this.wallets[memberId] || null; }

  mintTokens(memberId: string, amount: number) {
    if (!this.wallets[memberId]) return null;
    this.wallets[memberId].balance += amount;
    this.wallets[memberId].transactions.push({ type: 'MINT', amount, timestamp: new Date() });
    return this.wallets[memberId];
  }

  transfer(fromId: string, toId: string, amount: number) {
    const from = this.wallets[fromId];
    const to = this.wallets[toId];
    if (!from || !to || from.balance < amount) return null;
    from.balance -= amount;
    to.balance += amount;
    from.transactions.push({ type: 'SEND', amount, to: to.address, timestamp: new Date() });
    to.transactions.push({ type: 'RECEIVE', amount, from: from.address, timestamp: new Date() });
    return { from: from.balance, to: to.balance };
  }

  getRateInIdr() { return { coin: 'GAME Token', rate: 150 }; }
}
