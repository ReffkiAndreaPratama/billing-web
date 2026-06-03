import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgentService {
  private agents = new Map<string, AgentInfo>();
  private agentStats = new Map<string, SystemStats>();

  constructor(private prisma: PrismaService) {}

  registerAgent(data: {
    machineId: string;
    branchId: string;
    hostname: string;
    platform: string;
    arch: string;
    socketId: string;
  }): AgentInfo {
    const agent: AgentInfo = {
      machineId: data.machineId,
      branchId: data.branchId,
      hostname: data.hostname,
      platform: data.platform,
      arch: data.arch,
      socketId: data.socketId,
      unitName: null,
      lastSeen: new Date(),
      status: 'online',
    };

    this.agents.set(data.machineId, agent);
    return agent;
  }

  unregisterAgent(machineId: string) {
    this.agents.delete(machineId);
    this.agentStats.delete(machineId);
  }

  updateStats(machineId: string, stats: SystemStats) {
    stats.timestamp = new Date(stats.timestamp);
    this.agentStats.set(machineId, stats);

    const agent = this.agents.get(machineId);
    if (agent) {
      agent.lastSeen = new Date();
    }
  }

  getAgent(machineId: string): AgentInfo | undefined {
    return this.agents.get(machineId);
  }

  getAllAgents(branchId?: string): AgentInfo[] {
    const agents = Array.from(this.agents.values());
    return branchId ? agents.filter(a => a.branchId === branchId) : agents;
  }

  getAgentStats(machineId: string): SystemStats | undefined {
    return this.agentStats.get(machineId);
  }

  getOnlineCount(): number {
    return this.agents.size;
  }

  getOnlineCountByBranch(branchId: string): number {
    return Array.from(this.agents.values()).filter(a => a.branchId === branchId).length;
  }
}

export interface AgentInfo {
  machineId: string;
  branchId: string;
  hostname: string;
  platform: string;
  arch: string;
  socketId: string;
  unitName: string | null;
  lastSeen: Date;
  status: 'online' | 'offline';
}

export interface SystemStats {
  cpu: { load: number; cores: number; temp: number | null };
  memory: { total: number; used: number; free: number; usagePercent: number };
  disk: { mount: string; total: number; used: number; free: number; usagePercent: number }[];
  network: { interface: string; rxSec: number; txSec: number }[];
  os: { platform: string; distro: string; release: string; hostname: string; uptime: number };
  processes: { total: number; running: number };
  activeWindow: { title: string; application: string } | null;
  timestamp: Date;
}
