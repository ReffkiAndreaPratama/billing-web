import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { SmartRulesService } from './smart-rules.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('smart-rules')
@UseGuards(JwtAuthGuard)
export class SmartRulesController {
  constructor(private rules: SmartRulesService) {}

  @Post('check-idle')
  checkIdle() {
    return this.rules.checkIdleSessions();
  }
}
