import { Injectable } from '@nestjs/common';

@Injectable()
export class InternetMgmtService {
  private rules = [
    { id: 'bw-1', name: 'Gaming Priority', type: 'QOS', priority: 1, bandwidthMbps: 100, active: true },
    { id: 'bw-2', name: 'Streaming', type: 'QOS', priority: 2, bandwidthMbps: 50, active: true },
    { id: 'bw-3', name: 'Download', type: 'QOS', priority: 3, bandwidthMbps: 30, active: true },
  ];
  private blocks = [{ url: 'youtube.com', type: 'SLOW', active: false }, { url: 'tiktok.com', type: 'BLOCK', active: true }];
  private pcLimits: Record<string, number> = { 'unit-1': 50, 'unit-2': 30, 'unit-3': 100 };
  private usage: Record<string, number> = { 'unit-1': 12.5, 'unit-2': 28.3, 'unit-3': 45.1 };

  getRules() { return this.rules; }
  getBlocks() { return this.blocks; }
  getPcLimits() { return this.pcLimits; }
  getUsage() { return this.usage; }

  setPcLimit(unitId: string, mbps: number) { this.pcLimits[unitId] = mbps; return this.pcLimits; }
  toggleBlock(url: string) { const b = this.blocks.find(x => x.url === url); if (b) b.active = !b.active; return b; }
  toggleRule(id: string) { const r = this.rules.find(x => x.id === id); if (r) r.active = !r.active; return r; }
}
