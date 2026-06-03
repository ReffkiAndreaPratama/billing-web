const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

async function fetchApi(path: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message || err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  auth: {
    login: (data: { username: string; password: string }) =>
      fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    profile: () => fetchApi('/auth/profile'),
  },
  units: {
    list: (branchId?: string) => fetchApi(`/units${branchId ? `?branchId=${branchId}` : ''}`),
    map: (branchId: string) => fetchApi(`/units/map/${branchId}`),
    create: (data: any) => fetchApi('/units', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      fetchApi(`/units/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  members: {
    list: (params?: string) => fetchApi(`/members${params ? `?${params}` : ''}`),
    get: (id: string) => fetchApi(`/members/${id}`),
    findByRfid: (tag: string) => fetchApi(`/members/rfid/${tag}`),
    findByPhone: (phone: string) => fetchApi(`/members/phone/${phone}`),
    create: (data: any) => fetchApi('/members', { method: 'POST', body: JSON.stringify(data) }),
    topup: (id: string, data: any) =>
      fetchApi(`/members/${id}/topup`, { method: 'POST', body: JSON.stringify(data) }),
  },
  billing: {
    start: (data: any) => fetchApi('/billing/start', { method: 'POST', body: JSON.stringify(data) }),
    end: (id: string) => fetchApi(`/billing/${id}/end`, { method: 'POST' }),
    pause: (id: string, reason?: string) =>
      fetchApi(`/billing/${id}/pause`, { method: 'POST', body: JSON.stringify({ reason }) }),
    resume: (id: string) => fetchApi(`/billing/${id}/resume`, { method: 'POST' }),
    active: (branchId?: string) => fetchApi(`/billing/active${branchId ? `?branchId=${branchId}` : ''}`),
    history: (params?: string) => fetchApi(`/billing/history${params ? `?${params}` : ''}`),
  },
  bookings: {
    list: (params?: string) => fetchApi(`/bookings${params ? `?${params}` : ''}`),
    create: (data: any) => fetchApi('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      fetchApi(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  shifts: {
    open: (data: any) => fetchApi('/shifts/open', { method: 'POST', body: JSON.stringify(data) }),
    close: (id: string, data: any) =>
      fetchApi(`/shifts/${id}/close`, { method: 'POST', body: JSON.stringify(data) }),
    list: (params?: string) => fetchApi(`/shifts${params ? `?${params}` : ''}`),
  },
  packages: {
    list: (branchId?: string) => fetchApi(`/packages${branchId ? `?branchId=${branchId}` : ''}`),
  },
  promos: {
    validate: (code: string, amount: number) =>
      fetchApi('/promos/validate', { method: 'POST', body: JSON.stringify({ code, amount }) }),
  },
  tournaments: {
    list: () => fetchApi('/tournaments'),
    create: (data: any) => fetchApi('/tournaments', { method: 'POST', body: JSON.stringify(data) }),
    registerTeam: (id: string, data: any) =>
      fetchApi(`/tournaments/${id}/register`, { method: 'POST', body: JSON.stringify(data) }),
  },
  analytics: {
    dashboard: (branchId?: string) => fetchApi(`/analytics/dashboard${branchId ? `?branchId=${branchId}` : ''}`),
    revenue: (period: string, branchId?: string) =>
      fetchApi(`/analytics/revenue?period=${period}${branchId ? `&branchId=${branchId}` : ''}`),
    peakHours: (branchId?: string) => fetchApi(`/analytics/peak-hours${branchId ? `?branchId=${branchId}` : ''}`),
    unitProfitability: (branchId?: string) => fetchApi(`/analytics/unit-profitability${branchId ? `?branchId=${branchId}` : ''}`),
  },
  vouchers: {
    list: (branchId?: string) => fetchApi(`/vouchers${branchId ? `?branchId=${branchId}` : ''}`),
    generate: (data: any) => fetchApi('/vouchers/generate', { method: 'POST', body: JSON.stringify(data) }),
    validate: (data: { code: string; amount: number; memberId?: string }) =>
      fetchApi('/vouchers/validate', { method: 'POST', body: JSON.stringify(data) }),
  },
  employees: {
    list: (branchId?: string) => fetchApi(`/employees${branchId ? `?branchId=${branchId}` : ''}`),
    create: (data: any) => fetchApi('/employees', { method: 'POST', body: JSON.stringify(data) }),
    clockIn: (employeeId: string) => fetchApi('/employees/clock-in', { method: 'POST', body: JSON.stringify({ employeeId }) }),
    clockOut: (id: string) => fetchApi(`/employees/clock-out/${id}`, { method: 'POST' }),
    attendance: (params?: string) => fetchApi(`/employees/attendance${params ? `?${params}` : ''}`),
  },
  assets: {
    list: (branchId?: string) => fetchApi(`/assets${branchId ? `?branchId=${branchId}` : ''}`),
    create: (data: any) => fetchApi('/assets', { method: 'POST', body: JSON.stringify(data) }),
    addMaintenance: (unitId: string, data: any) =>
      fetchApi(`/assets/${unitId}/maintenance`, { method: 'POST', body: JSON.stringify(data) }),
  },
  queue: {
    get: (branchId: string) => fetchApi(`/queue/${branchId}`),
    join: (data: any) => fetchApi('/queue/join', { method: 'POST', body: JSON.stringify(data) }),
    serve: (id: string) => fetchApi(`/queue/serve/${id}`, { method: 'POST' }),
    cancel: (id: string) => fetchApi(`/queue/cancel/${id}`, { method: 'POST' }),
    estimate: (branchId: string, unitType?: string) => fetchApi(`/queue/estimate/${branchId}${unitType ? `?unitType=${unitType}` : ''}`),
  },
  gamification: {
    award: (data: { memberId: string; points: number; reason: string }) =>
      fetchApi('/gamification/award', { method: 'POST', body: JSON.stringify(data) }),
    redeem: (data: { memberId: string; points: number; description: string }) =>
      fetchApi('/gamification/redeem', { method: 'POST', body: JSON.stringify(data) }),
    leaderboard: (branchId?: string, limit?: number) =>
      fetchApi(`/gamification/leaderboard${branchId ? `?branchId=${branchId}` : ''}${limit ? `${branchId ? '&' : '?'}limit=${limit}` : ''}`),
  },
  notifications: {
    list: (limit?: number) => fetchApi(`/notifications${limit ? `?limit=${limit}` : ''}`),
    send: (data: { userId: string; title: string; message: string; type?: string }) =>
      fetchApi('/notifications/send', { method: 'POST', body: JSON.stringify(data) }),
    whatsapp: (data: { phone: string; message: string }) =>
      fetchApi('/notifications/whatsapp', { method: 'POST', body: JSON.stringify(data) }),
  },
  payment: {
    pay: (data: { billingId: string; amount: number; method: string; memberId?: string; branchId?: string }) =>
      fetchApi('/payment/pay', { method: 'POST', body: JSON.stringify(data) }),
    qris: (data: { amount: number; invoiceNumber: string }) =>
      fetchApi('/payment/qris', { method: 'POST', body: JSON.stringify(data) }),
    va: (data: { amount: number; invoiceNumber: string; bank: string }) =>
      fetchApi('/payment/va', { method: 'POST', body: JSON.stringify(data) }),
  },
  reports: {
    daily: (date?: string, branchId?: string) =>
      fetchApi(`/reports/daily?date=${date || ''}${branchId ? `&branchId=${branchId}` : ''}`),
  },
}
