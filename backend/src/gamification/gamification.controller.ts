import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private gamification: GamificationService) {}

  @Post('award')
  award(@Body() dto: { memberId: string; points: number; reason: string }) {
    return this.gamification.awardPoints(dto.memberId, dto.points, dto.reason);
  }

  @Post('redeem')
  redeem(@Body() dto: { memberId: string; points: number; description: string }) {
    return this.gamification.redeemPoints(dto.memberId, dto.points, dto.description);
  }

  @Get('leaderboard')
  leaderboard(@Query('branchId') branchId?: string, @Query('limit') limit?: string) {
    return this.gamification.getLeaderboard(branchId, limit ? Number(limit) : 20);
  }

  @Get('logs/:memberId')
  logs(@Param('memberId') memberId: string) {
    return this.gamification.getLogs(memberId);
  }
}
