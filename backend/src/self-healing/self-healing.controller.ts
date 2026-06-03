import { Controller, Get, Post, Param } from '@nestjs/common';
import { SelfHealingService } from './self-healing.service';
@Controller('self-healing')
export class SelfHealingController {
  constructor(private svc: SelfHealingService) {}
  @Get('check') check() { return this.svc.check(); }
  @Post('heal/:service') heal(@Param('service') service: string) { return this.svc.heal(service); }
  @Get('incidents') incidents() { return this.svc.getIncidents(); }
  @Get('diagnostics') diagnostics() { return { report: this.svc.getDiagnostics() }; }
}
