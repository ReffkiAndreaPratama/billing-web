import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto, TopupDto } from './member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private member: MemberService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.member.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.member.findById(id);
  }

  @Get('rfid/:tag')
  findByRfid(@Param('tag') tag: string) {
    return this.member.findByRfid(tag);
  }

  @Get('phone/:phone')
  getByPhone(@Param('phone') phone: string) {
    return this.member.getByPhone(phone);
  }

  @Post()
  create(@Body() dto: CreateMemberDto) {
    return this.member.create(dto);
  }

  @Post(':id/topup')
  topup(@Param('id') id: string, @Body() dto: TopupDto, @CurrentUser('id') userId: string) {
    return this.member.topup(id, dto, userId);
  }
}
