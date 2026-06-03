import { Controller, Get, Param, Query, Post, Body, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get()
  getAllAgents(@Query('branchId') branchId?: string) {
    const agents = this.agentService.getAllAgents(branchId);
    return agents.map(a => ({
      machineId: a.machineId,
      hostname: a.hostname,
      platform: a.platform,
      branchId: a.branchId,
      status: a.status,
      lastSeen: a.lastSeen,
      unitName: a.unitName,
    }));
  }

  @Get('stats/:machineId')
  getAgentStats(@Param('machineId') machineId: string) {
    return this.agentService.getAgentStats(machineId);
  }

  @Get('count')
  getCount(@Query('branchId') branchId?: string) {
    return {
      online: branchId
        ? this.agentService.getOnlineCountByBranch(branchId)
        : this.agentService.getOnlineCount(),
    };
  }
}
