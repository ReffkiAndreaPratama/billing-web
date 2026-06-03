import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
@Controller('blockchain')
export class BlockchainController {
  constructor(private svc: BlockchainService) {}
  @Get('wallet/:memberId') getWallet(@Param('memberId') id: string) { return this.svc.getWallet(id); }
  @Post('mint') mint(@Body('memberId') memberId: string, @Body('amount') amount: number) { return this.svc.mintTokens(memberId, amount); }
  @Post('transfer') transfer(@Body('fromId') fromId: string, @Body('toId') toId: string, @Body('amount') amount: number) { return this.svc.transfer(fromId, toId, amount); }
  @Get('rate') getRate() { return this.svc.getRateInIdr(); }
}
