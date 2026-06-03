import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // ramp up
    { duration: '1m', target: 50 },    // sustain
    { duration: '30s', target: 100 },  // spike
    { duration: '1m', target: 100 },   // sustain spike
    { duration: '30s', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% requests under 2s
    http_req_failed: ['rate<0.05'],    // <5% failure rate
  },
};

const BASE = 'http://localhost:4000/api';
let token = '';

export function setup() {
  const r = http.post(`${BASE}/auth/login`, JSON.stringify({ username: 'admin', password: 'admin123' }), {
    headers: { 'Content-Type': 'application/json' },
  });
  token = r.json('access_token');
  return { token };
}

export default function (data: { token: string }) {
  const headers = { Authorization: `Bearer ${data.token}`, 'Content-Type': 'application/json' };

  // GET requests
  const endpoints = [
    '/units',
    '/members',
    '/billing/active',
    '/dashboard/stats',
    '/reports/summary',
    '/bookings',
    '/shifts',
    '/inventory',
    '/tournaments',
    '/notifications',
    '/analytics/peak-hours',
    '/promo/active',
    '/queue/status',
    '/employees',
    '/vouchers',
    '/leaderboard',
    '/shift',
    '/assets',
    '/config/public',
  ];

  for (const ep of endpoints) {
    const r = http.get(`${BASE}${ep}`, { headers });
    check(r, { [`GET ${ep} status 200/401`]: (res) => [200, 401].includes(res.status) });
    sleep(0.1);
  }

  // POST - create billing session
  const billing = http.post(`${BASE}/billing/start`, JSON.stringify({
    unitId: 'unit-1', packageId: 'pkg-1', memberId: 'member-1',
  }), { headers });
  check(billing, { 'POST /billing/start status 201': (r) => r.status === 201 });
  sleep(0.5);

  // POST - end session
  if (billing.status === 201) {
    const sessionId = billing.json('sessionId');
    const end = http.post(`${BASE}/billing/end/${sessionId}`, {}, { headers });
    check(end, { 'POST /billing/end status 200': (r) => r.status === 200 });
  }

  // POST - queue add
  const queue = http.post(`${BASE}/queue/add`, JSON.stringify({
    name: `load-test-${__VU}`, partySize: 2,
  }), { headers });
  check(queue, { 'POST /queue/add status 201': (r) => r.status === 201 });
}

export function teardown(data: { token: string }) {
  // cleanup test data if needed
}
