import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private event: EventService) {}

  @Get()
  list(@Query('branchId') branchId?: string) {
    return this.event.list(branchId);
  }

  @Post()
  create(@Body() dto: { name: string; description?: string; type: string; startDate: string; endDate: string; maxParticipants?: number; branchId?: string; entryFee?: number; prizePool?: number }) {
    return this.event.create(dto);
  }

  @Post(':id/register')
  register(@Param('id') id: string, @Body('memberId') memberId: string) {
    return this.event.register(id, memberId);
  }
}
