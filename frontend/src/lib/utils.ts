import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}j`
  return `${h}j ${m}m`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'text-green-400',
    IN_USE: 'text-cyan-400',
    BOOKED: 'text-yellow-400',
    MAINTENANCE: 'text-red-400',
    ACTIVE: 'text-cyan-400',
    PAUSED: 'text-yellow-400',
    COMPLETED: 'text-green-400',
    CANCELLED: 'text-red-400',
    PENDING: 'text-yellow-400',
    CONFIRMED: 'text-blue-400',
    PAID: 'text-green-400',
    OPEN: 'text-green-400',
    CLOSED: 'text-gray-400',
  }
  return colors[status] || 'text-gray-400'
}

export function getStatusBg(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-green-500/10 border-green-500/30',
    IN_USE: 'bg-cyan-500/10 border-cyan-500/30',
    BOOKED: 'bg-yellow-500/10 border-yellow-500/30',
    MAINTENANCE: 'bg-red-500/10 border-red-500/30',
    ACTIVE: 'bg-cyan-500/10 border-cyan-500/30',
    PAUSED: 'bg-yellow-500/10 border-yellow-500/30',
    COMPLETED: 'bg-green-500/10 border-green-500/30',
    PENDING: 'bg-yellow-500/10 border-yellow-500/30',
    OPEN: 'bg-green-500/10 border-green-500/30',
    CLOSED: 'bg-gray-500/10 border-gray-500/30',
  }
  return colors[status] || 'bg-gray-500/10'
}
