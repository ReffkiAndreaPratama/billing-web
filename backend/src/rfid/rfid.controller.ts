import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RfidService } from './rfid.service';

@Controller('rfid')
export class RfidController {
  constructor(private rfid: RfidService) {}

  @Get('cards') getCards() { return this.rfid.getCards(); }

  @Post('tap') tap(@Body('uid') uid: string) { return this.rfid.tap(uid); }

  @Post('register')
  register(@Body() dto: { uid: string; memberId: string; memberName: string }) { return this.rfid.register(dto.uid, dto.memberId, dto.memberName); }

  @Post('toggle/:uid') toggle(@Param('uid') uid: string) { return this.rfid.toggle(uid); }
}
