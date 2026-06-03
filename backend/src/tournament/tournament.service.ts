import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TournamentService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    game: string;
    type: string;
    maxTeams: number;
    maxPlayers: number;
    prizePool: number;
    entryFee: number;
    startDate: string;
    rules?: string;
  }) {
    return this.prisma.tournament.create({
      data: {
        name: data.name,
        game: data.game,
        type: data.type,
        maxTeams: data.maxTeams,
        maxPlayers: data.maxPlayers,
        prizePool: data.prizePool,
        entryFee: data.entryFee,
        startDate: new Date(data.startDate),
        rules: data.rules,
        status: 'DRAFT',
      },
    });
  }

  async findAll() {
    return this.prisma.tournament.findMany({
      include: { _count: { select: { teams: true, matches: true } } },
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: true,
        matches: { orderBy: [{ round: 'asc' }, { matchOrder: 'asc' }] },
      },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async registerTeam(tournamentId: string, data: { name: string; captainName: string; captainPhone: string }) {
    const tournament = await this.findById(tournamentId);
    if (tournament.status !== 'REGISTRATION') throw new BadRequestException('Registration is not open');
    if (tournament.teams.length >= tournament.maxTeams) throw new BadRequestException('Tournament is full');

    return this.prisma.team.create({
      data: {
        name: data.name,
        captainName: data.captainName,
        captainPhone: data.captainPhone,
        tournamentId,
      },
    });
  }

  async startTournament(id: string) {
    const tournament = await this.findById(id);
    if (tournament.teams.length < 2) throw new BadRequestException('Need at least 2 teams');

    const teams = tournament.teams;
    const matches: any[] = [];

    // Generate bracket
    for (let i = 0; i < teams.length; i += 2) {
      if (i + 1 < teams.length) {
        matches.push({
          round: 1,
          matchOrder: Math.floor(i / 2) + 1,
          homeTeamId: teams[i].id,
          awayTeamId: teams[i + 1].id,
          tournamentId: id,
          status: 'SCHEDULED',
        });
      }
    }

    await this.prisma.match.createMany({ data: matches });

    return this.prisma.tournament.update({
      where: { id },
      data: { status: 'ONGOING' },
    });
  }

  async updateMatchScore(matchId: string, homeScore: number, awayScore: number) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match not found');

    const winnerId = homeScore > awayScore ? match.homeTeamId : match.awayTeamId;

    return this.prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, winnerId, status: 'COMPLETED' },
    });
  }
}
