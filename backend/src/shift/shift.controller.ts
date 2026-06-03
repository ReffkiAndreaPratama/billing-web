import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftController {
  constructor(private shift: ShiftService) {}

  @Post('open')
  open(
    @CurrentUser('id') userId: string,
    @Body('branchId') branchId: string,
    @Body('initialCash') initialCash: number,
  ) {
    return this.shift.openShift(userId, branchId, initialCash || 0);
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Body('actualCash') actualCash: number, @Body('notes') notes?: string) {
    return this.shift.closeShift(id, actualCash, notes);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.shift.getShifts(query);
  }
}
