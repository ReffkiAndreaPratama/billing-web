import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingController {
  constructor(private booking: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: any) {
    return this.booking.create(dto);
  }

  @Post('public')
  createPublic(@Body() dto: { unitId: string; customerName: string; customerPhone: string; startTime: string; endTime: string }) {
    return this.booking.create({
      unitId: dto.unitId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: 'PENDING',
    } as any);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: any) {
    return this.booking.findAll(query);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.booking.updateStatus(id, status);
  }
}
