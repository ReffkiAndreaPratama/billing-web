import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PromoService } from './promo.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('promos')
@UseGuards(JwtAuthGuard)
export class PromoController {
  constructor(private promo: PromoService) {}

  @Get()
  findAll(@Query('branchId') branchId?: string) {
    return this.promo.findAll(branchId);
  }

  @Post('validate')
  validate(@Body('code') code: string, @Body('amount') amount: number) {
    return this.promo.validate(code, amount);
  }
}
