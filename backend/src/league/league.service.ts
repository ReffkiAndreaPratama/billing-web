import { Injectable } from '@nestjs/common';

export interface Season { id: string; name: string; game: string; startDate: string; endDate: string; status: 'UPCOMING' | 'ACTIVE' | 'ENDED'; }
export interface LeagueEntry { id: string; seasonId: string; playerName: string; playerId: string; points: number; wins: number; losses: number; rank: number; }
export interface SeasonReward { seasonId: string; rankMin: number; rankMax: number; reward: string; }

@Injectable()
export class LeagueService {
  private seasons: Season[] = [];
  private entries: LeagueEntry[] = [];
  private rewards: SeasonReward[] = [];

  createSeason(dto: Omit<Season, 'id'>): Season {
    const season: Season = { id: `season-${Date.now()}`, ...dto };
    this.seasons.push(season);
    return season;
  }

  getSeasons(): Season[] { return this.seasons; }

  getSeason(id: string): Season | undefined { return this.seasons.find(s => s.id === id); }

  startSeason(id: string): Season | null {
    const season = this.seasons.find(s => s.id === id);
    if (season && season.status === 'UPCOMING') { season.status = 'ACTIVE'; return season; }
    return null;
  }

  endSeason(id: string): Season | null {
    const season = this.seasons.find(s => s.id === id);
    if (season && season.status === 'ACTIVE') { season.status = 'ENDED'; return season; }
    return null;
  }

  registerPlayer(seasonId: string, playerName: string, playerId: string): LeagueEntry {
    const entry: LeagueEntry = {
      id: `entry-${Date.now()}`, seasonId, playerName, playerId,
      points: 0, wins: 0, losses: 0, rank: 0,
    };
    this.entries.push(entry);
    this.recalculateRanks(seasonId);
    return entry;
  }

  recordMatch(seasonId: string, winnerId: string, loserId: string): { winner: LeagueEntry | null; loser: LeagueEntry | null } {
    const winner = this.entries.find(e => e.seasonId === seasonId && e.playerId === winnerId) || null;
    const loser = this.entries.find(e => e.seasonId === seasonId && e.playerId === loserId) || null;
    if (winner && loser) {
      winner.wins++;
      winner.points += 3;
      loser.losses++;
      this.recalculateRanks(seasonId);
    }
    return { winner, loser };
  }

  getLeaderboard(seasonId: string): LeagueEntry[] {
    return this.entries.filter(e => e.seasonId === seasonId).sort((a, b) => a.rank - b.rank);
  }

  addReward(dto: SeasonReward): SeasonReward {
    this.rewards.push(dto); return dto;
  }

  getRewards(seasonId: string): SeasonReward[] {
    return this.rewards.filter(r => r.seasonId === seasonId);
  }

  private recalculateRanks(seasonId: string) {
    const seasonEntries = this.entries.filter(e => e.seasonId === seasonId)
      .sort((a, b) => b.points - a.points || (b.wins - b.losses) - (a.wins - a.losses));
    seasonEntries.forEach((e, i) => e.rank = i + 1);
  }
}
