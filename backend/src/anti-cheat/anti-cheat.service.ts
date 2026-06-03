import { Injectable } from '@nestjs/common';

export interface ScanReport { id: string; unitId: string; results: { processName: string; risk: 'LOW' | 'MEDIUM' | 'HIGH'; reason: string }[]; safe: boolean; timestamp: Date; }

@Injectable()
export class AntiCheatService {
  private reports: ScanReport[] = [];
  private blacklist: string[] = [
    'cheatengine.exe', 'artmoney.exe', 'wpepro.exe', 'ollydbg.exe',
    'x64dbg.exe', 'processhacker.exe', 'injector.exe', 'dllinject.exe',
    'autoit3.exe', 'autohotkey.exe', 'pixelsearch.exe',
  ];

  scan(unitId: string): ScanReport {
    const results: { processName: string; risk: 'LOW' | 'MEDIUM' | 'HIGH'; reason: string }[] = [];
    const runningProcesses = [
      'explorer.exe', 'chrome.exe', 'discord.exe', 'steam.exe',
      'cheatengine.exe', 'spotify.exe', 'VALORANT.exe',
    ];

    runningProcesses.forEach(p => {
      if (this.blacklist.includes(p.toLowerCase())) {
        results.push({ processName: p, risk: 'HIGH', reason: 'Known cheat tool detected' });
      }
    });

    const safe = results.filter(r => r.risk === 'HIGH').length === 0;
    const report: ScanReport = { id: `scan-${Date.now()}`, unitId, results, safe, timestamp: new Date() };
    this.reports.push(report);
    return report;
  }

  getReports(unitId?: string): ScanReport[] {
    return unitId ? this.reports.filter(r => r.unitId === unitId) : this.reports;
  }

  getBlacklist(): string[] { return this.blacklist; }

  addBlacklist(processName: string) {
    if (!this.blacklist.includes(processName)) this.blacklist.push(processName);
  }
}
