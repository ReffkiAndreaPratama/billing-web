export interface User {
  id: string
  username: string
  name: string
  role: 'SUPERADMIN' | 'OWNER' | 'ADMIN' | 'KASIR'
  branchId?: string
  phone?: string
  email?: string
}

export interface Unit {
  id: string
  name: string
  code: string
  type: 'PC' | 'PS4' | 'PS5' | 'ROOM_VIP' | 'ROOM_VVIP'
  status: 'AVAILABLE' | 'IN_USE' | 'BOOKED' | 'MAINTENANCE'
  hourlyRate: number
  vipRate?: number
  positionX?: number
  positionY?: number
  width?: number
  height?: number
  branchId: string
  isActive?: boolean
}

export interface Member {
  id: string
  code: string
  name: string
  phone: string
  email?: string
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
  balance: number
  totalPoints: number
  totalSpent: number
  visitCount: number
  rfidTag?: string
}

export interface BillingSession {
  id: string
  startTime: string
  endTime?: string
  duration: number
  actualMinutes?: number
  totalCost: number
  overtimeCost: number
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'OVERTIME'
  unit: Unit
  member?: Member
  package?: Package
  pauses: SessionPause[]
}

export interface Package {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  type?: string
}

export interface SessionPause {
  id: string
  pauseStart: string
  pauseEnd?: string
  duration?: number
  reason?: string
}

export interface Transaction {
  id: string
  invoiceNumber: string
  type: string
  amount: number
  paymentMethod?: string
  paymentStatus: string
  member?: Member
  billing?: BillingSession
  createdAt: string
}

export interface Booking {
  id: string
  code: string
  startTime: string
  endTime: string
  status: string
  unit: Unit
  member?: Member
  customerName?: string
  customerPhone?: string
  totalCost: number
  deposit: number
}

export interface DashboardData {
  activeSessions: number
  todayRevenue: number
  totalMembers: number
  totalUnits: number
  usedUnits: number
  availableUnits: number
  occupancyRate: number
  recentTransactions: Transaction[]
}
