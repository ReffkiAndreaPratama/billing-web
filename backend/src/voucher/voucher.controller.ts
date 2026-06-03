import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('vouchers')
@UseGuards(JwtAuthGuard)
export class VoucherController {
  constructor(private voucher: VoucherService) {}

  @Get()
  list(@Query('branchId') branchId?: string) {
    return this.voucher.list(branchId);
  }

  @Post('generate')
  generate(@Body() dto: any) {
    return this.voucher.generate(dto);
  }

  @Post('validate')
  validate(@Body() dto: { code: string; amount: number; memberId?: string }) {
    return this.voucher.validate(dto.code, dto.amount, dto.memberId);
  }

  @Post('referral/:memberId')
  referral(@Param('memberId') memberId: string) {
    return this.voucher.generateReferralCode(memberId);
  }

  @Post('referral/redeem')
  redeemReferral(@Body() dto: { referrerId: string; newMemberId: string }) {
    return this.voucher.processReferral(dto.referrerId, dto.newMemberId);
  }
}
