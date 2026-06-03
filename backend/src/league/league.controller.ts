import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { LeagueService } from './league.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('league')
@UseGuards(JwtAuthGuard)
export class LeagueController {
  constructor(private league: LeagueService) {}

  @Post('season') createSeason(@Body() dto: any) { return this.league.createSeason(dto); }
  @Get('seasons') getSeasons() { return this.league.getSeasons(); }
  @Get('season/:id') getSeason(@Param('id') id: string) { return this.league.getSeason(id); }
  @Post('season/:id/start') startSeason(@Param('id') id: string) { return this.league.startSeason(id); }
  @Post('season/:id/end') endSeason(@Param('id') id: string) { return this.league.endSeason(id); }

  @Post('register')
  register(@Body() dto: { seasonId: string; playerName: string; playerId: string }) {
    return this.league.registerPlayer(dto.seasonId, dto.playerName, dto.playerId);
  }

  @Post('match')
  recordMatch(@Body() dto: { seasonId: string; winnerId: string; loserId: string }) {
    return this.league.recordMatch(dto.seasonId, dto.winnerId, dto.loserId);
  }

  @Get('leaderboard/:seasonId')
  leaderboard(@Param('seasonId') seasonId: string) { return this.league.getLeaderboard(seasonId); }

  @Post('reward') addReward(@Body() dto: any) { return this.league.addReward(dto); }
  @Get('rewards/:seasonId') getRewards(@Param('seasonId') seasonId: string) { return this.league.getRewards(seasonId); }
}
