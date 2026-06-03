'use client'

import { create } from 'zustand'
import type { BillingSession } from '@/types'

interface BillingState {
  sessions: BillingSession[]
  loading: boolean
  error: string | null
  setSessions: (sessions: BillingSession[]) => void
  upsertSession: (session: BillingSession) => void
  removeSession: (sessionId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useBillingStore = create<BillingState>((set, get) => ({
  sessions: [],
  loading: false,
  error: null,
  setSessions: (sessions) => set({ sessions }),
  upsertSession: (session) => {
    const existing = get().sessions.find(s => s.id === session.id)
    if (existing) {
      set({ sessions: get().sessions.map(s => s.id === session.id ? { ...s, ...session } : s) })
    } else {
      set({ sessions: [...get().sessions, session] })
    }
  },
  removeSession: (sessionId) => {
    set({ sessions: get().sessions.filter(s => s.id !== sessionId) })
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
