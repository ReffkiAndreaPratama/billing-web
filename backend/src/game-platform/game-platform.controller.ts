import { Controller, Get, Param } from '@nestjs/common';
import { GamePlatformService } from './game-platform.service';
@Controller('game-platform')
export class GamePlatformController {
  constructor(private svc: GamePlatformService) {}
  @Get('player/:memberId') getPlayer(@Param('memberId') id: string) { return this.svc.getPlayerStats(id); }
  @Get('popular') getPopular() { return this.svc.getPopularGames(); }
  @Get('hours/:memberId') getHours(@Param('memberId') id: string) { return { totalHours: this.svc.getTotalHours(id) }; }
}
