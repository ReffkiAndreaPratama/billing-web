import { Injectable } from '@nestjs/common';

@Injectable()
export class GamePlatformService {
  private players: Record<string, any> = {
    'member-1': { steam: { id: '76561198000000001', name: 'BudiGamer', hours: 2450, games: ['CS2', 'Dota 2', 'PUBG'] }, epic: { id: 'epic-budi', name: 'Budi', hours: 320, games: ['Fortnite', 'Rocket League'] }, riot: { id: 'budi#1234', name: 'Budi', rank: 'Platinum 2', hours: 890 } },
    'member-2': { steam: { id: '76561198000000002', name: 'AniStream', hours: 1200, games: ['GTA V', 'Valheim'] }, riot: { id: 'ani#5678', name: 'Ani', rank: 'Gold 1', hours: 450 } },
  };
  private popular: any[] = [
    { game: 'VALORANT', playHours: 4500, peakPlayers: 120, rank: 1 },
    { game: 'Mobile Legends', playHours: 3800, peakPlayers: 95, rank: 2 },
    { game: 'Dota 2', playHours: 3200, peakPlayers: 80, rank: 3 },
    { game: 'PUBG', playHours: 2800, peakPlayers: 70, rank: 4 },
    { game: 'CS2', playHours: 2100, peakPlayers: 55, rank: 5 },
  ];

  getPlayerStats(memberId: string) { return this.players[memberId] || null; }
  getPopularGames() { return this.popular; }
  getTotalHours(memberId: string) { const p = this.players[memberId]; if (!p) return 0; return Object.values(p).reduce((s: number, v: any) => s + (v.hours || 0), 0); }
}
