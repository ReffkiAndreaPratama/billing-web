import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private register: client.Registry;
  public activeSessions: client.Gauge;
  public revenueToday: client.Gauge;
  public totalUnits: client.Gauge;
  public httpRequestsTotal: client.Counter;
  public httpRequestDuration: client.Histogram;

  onModuleInit() {
    this.register = client.register;
    this.register.setDefaultLabels({ app: 'billing-pro' });
    client.collectDefaultMetrics({ register: this.register });

    this.activeSessions = new client.Gauge({ name: 'billing_active_sessions_total', help: 'Active billing sessions', registers: [this.register] });
    this.revenueToday = new client.Gauge({ name: 'billing_revenue_today_total', help: 'Revenue today in IDR', registers: [this.register] });
    this.totalUnits = new client.Gauge({ name: 'billing_total_units', help: 'Total registered units', registers: [this.register] });
    this.httpRequestsTotal = new client.Counter({ name: 'billing_http_requests_total', help: 'Total HTTP requests', labelNames: ['method', 'path', 'status'], registers: [this.register] });
    this.httpRequestDuration = new client.Histogram({ name: 'billing_http_request_duration_ms', help: 'HTTP request duration ms', buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500], registers: [this.register] });
  }

  getMetrics() { return this.register.metrics(); }
}
