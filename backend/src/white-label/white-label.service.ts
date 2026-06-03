import { Injectable } from '@nestjs/common';

export interface Tenant { id: string; name: string; domain: string; logo: string; plan: 'BASIC' | 'PRO' | 'ENTERPRISE'; active: boolean; createdAt: Date; }

@Injectable()
export class WhiteLabelService {
  private tenants: Tenant[] = [
    { id: 't-1', name: 'NetZone Gaming', domain: 'netzone.billing.app', logo: '/logos/netzone.png', plan: 'PRO', active: true, createdAt: new Date() },
    { id: 't-2', name: 'Cyber Arena', domain: 'cyber.billing.app', logo: '/logos/cyber.png', plan: 'BASIC', active: true, createdAt: new Date() },
  ];

  getTenants(): Tenant[] { return this.tenants; }
  getTenant(id: string): Tenant | undefined { return this.tenants.find(t => t.id === id); }

  register(dto: { name: string; domain: string; plan: string }): Tenant {
    const tenant: Tenant = { id: `t-${Date.now()}`, ...dto, logo: '/logos/default.png', plan: dto.plan as any, active: true, createdAt: new Date() };
    this.tenants.push(tenant);
    return tenant;
  }

  toggle(id: string): Tenant | null { const t = this.tenants.find(x => x.id === id); if (t) t.active = !t.active; return t || null; }
  getPlans() { return [{ id: 'BASIC', price: 299000, features: ['1 cabang', '10 unit', 'Billing dasar', 'Laporan'] }, { id: 'PRO', price: 799000, features: ['3 cabang', '50 unit', 'Semua fitur', 'API access', 'Priority support'] }, { id: 'ENTERPRISE', price: 1999000, features: ['Unlimited', 'White label', 'SLA 99.9%', 'Dedicated support', 'On-premise'] }]; }
}
