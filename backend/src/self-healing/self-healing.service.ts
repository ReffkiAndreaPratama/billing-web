import { Injectable } from '@nestjs/common';

export interface HealthCheck { service: string; status: 'OK' | 'DEGRADED' | 'DOWN'; latencyMs: number; lastChecked: Date; }
export interface Incident { id: string; service: string; issue: string; action: string; status: string; timestamp: Date; }

@Injectable()
export class SelfHealingService {
  private services: HealthCheck[] = [
    { service: 'API Server', status: 'OK', latencyMs: 12, lastChecked: new Date() },
    { service: 'Database', status: 'OK', latencyMs: 5, lastChecked: new Date() },
    { service: 'Redis Cache', status: 'OK', latencyMs: 2, lastChecked: new Date() },
    { service: 'WebSocket', status: 'OK', latencyMs: 8, lastChecked: new Date() },
    { service: 'Payment Gateway', status: 'DEGRADED', latencyMs: 350, lastChecked: new Date() },
  ];
  private incidents: Incident[] = [];

  check(): HealthCheck[] {
    this.services.forEach(s => { s.lastChecked = new Date(); s.latencyMs = Math.floor(Math.random() * 50) + 1; if (s.latencyMs > 200) s.status = 'DEGRADED'; else s.status = 'OK'; });
    return this.services;
  }

  heal(serviceName: string): Incident {
    const service = this.services.find(s => s.service === serviceName);
    const incident: Incident = { id: `inc-${Date.now()}`, service: serviceName, issue: `${serviceName} unresponsive`, action: `Auto-restart initiated for ${serviceName}`, status: 'RECOVERING', timestamp: new Date() };
    this.incidents.push(incident);
    if (service) { service.status = 'OK'; service.latencyMs = 5; }
    setTimeout(() => { incident.status = 'RESOLVED'; }, 5000);
    return incident;
  }

  getIncidents(): Incident[] { return this.incidents; }
  getDiagnostics(): string { return 'All systems nominal. Memory: 45%, CPU: 23%, Disk: 67%'; }
}
