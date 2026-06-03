import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tournaments')
@UseGuards(JwtAuthGuard)
export class TournamentController {
  constructor(private tournament: TournamentService) {}

  @Post()
  create(@Body() dto: any) {
    return this.tournament.create(dto);
  }

  @Get()
  findAll() {
    return this.tournament.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.tournament.findById(id);
  }

  @Post(':id/register')
  registerTeam(@Param('id') id: string, @Body() dto: any) {
    return this.tournament.registerTeam(id, dto);
  }

  @Post(':id/start')
  start(@Param('id') id: string) {
    return this.tournament.startTournament(id);
  }
}
