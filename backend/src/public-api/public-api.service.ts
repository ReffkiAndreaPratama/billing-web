import { Injectable } from '@nestjs/common';

interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  auth: boolean;
  params?: string;
  body?: string;
}

@Injectable()
export class PublicApiService {
  getDocs(): { version: string; baseUrl: string; endpoints: ApiEndpoint[] } {
    return {
      version: '1.0.0',
      baseUrl: '/api',
      endpoints: [
        { path: '/auth/login', method: 'POST', description: 'Login with username/password', auth: false, body: '{ username: string, password: string }' },
        { path: '/auth/profile', method: 'GET', description: 'Get current user profile', auth: true },
        { path: '/units', method: 'GET', description: 'List all units (filter by branchId)', auth: true, params: '?branchId=xxx' },
        { path: '/units/:id/status', method: 'PATCH', description: 'Update unit status', auth: true, body: '{ status: string }' },
        { path: '/members', method: 'GET', description: 'List members', auth: true },
        { path: '/members/phone/:phone', method: 'GET', description: 'Find member by phone', auth: true },
        { path: '/members/rfid/:tag', method: 'GET', description: 'Find member by RFID tag', auth: true },
        { path: '/billing/start', method: 'POST', description: 'Start a billing session', auth: true, body: '{ unitId, duration, packageId?, memberId? }' },
        { path: '/billing/:id/end', method: 'POST', description: 'End a billing session', auth: true },
        { path: '/billing/:id/pause', method: 'POST', description: 'Pause billing', auth: true },
        { path: '/billing/:id/resume', method: 'POST', description: 'Resume billing', auth: true },
        { path: '/billing/active', method: 'GET', description: 'Get active billing sessions', auth: true, params: '?branchId=xxx' },
        { path: '/payment/pay', method: 'POST', description: 'Process payment', auth: true, body: '{ billingId, amount, method }' },
        { path: '/payment/qris', method: 'POST', description: 'Generate QRIS', auth: true, body: '{ amount, invoiceNumber }' },
        { path: '/payment/va', method: 'POST', description: 'Generate VA number', auth: true, body: '{ amount, invoiceNumber, bank }' },
        { path: '/bookings', method: 'GET', description: 'List bookings', auth: true },
        { path: '/bookings', method: 'POST', description: 'Create booking', auth: true, body: '{ unitId, startTime, endTime, memberId? }' },
        { path: '/vouchers', method: 'GET', description: 'List vouchers', auth: true },
        { path: '/vouchers/validate', method: 'POST', description: 'Validate voucher code', auth: true, body: '{ code, amount }' },
        { path: '/vouchers/generate', method: 'POST', description: 'Create voucher', auth: true, body: '{ code, name, discountType, discountValue }' },
        { path: '/employees', method: 'GET', description: 'List employees', auth: true },
        { path: '/employees/clock-in', method: 'POST', description: 'Clock in employee', auth: true, body: '{ employeeId }' },
        { path: '/assets', method: 'GET', description: 'List assets', auth: true },
        { path: '/inventory', method: 'GET', description: 'List inventory', auth: true },
        { path: '/shifts', method: 'GET', description: 'List shifts', auth: true },
        { path: '/notifications', method: 'GET', description: 'Get notifications', auth: true },
        { path: '/gamification/leaderboard', method: 'GET', description: 'Get member leaderboard', auth: true },
        { path: '/queue/:branchId', method: 'GET', description: 'Get waiting queue', auth: true },
        { path: '/events', method: 'GET', description: 'List events', auth: true },
        { path: '/pricing/rate/:unitId', method: 'GET', description: 'Get dynamic pricing', auth: true },
        { path: '/webhook/midtrans', method: 'POST', description: 'Midtrans payment notification', auth: false },
        { path: '/webhook/xendit', method: 'POST', description: 'Xendit payment notification', auth: false },
        { path: '/reports/daily', method: 'GET', description: 'Get daily report', auth: true, params: '?date=YYYY-MM-DD&branchId=xxx' },
        { path: '/analytics/dashboard', method: 'GET', description: 'Get dashboard analytics', auth: true },
      ],
    };
  }
}
