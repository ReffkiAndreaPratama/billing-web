'use client'

import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  }
  return socket
}

export function connectSocket(token?: string) {
  const s = getSocket()
  if (s.connected) return s

  if (token) {
    s.auth = { token }
  }

  s.connect()
  return s
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function onBillingEvent(event: string, callback: (data: any) => void) {
  const s = getSocket()
  s.on(event, callback)
  return () => { s.off(event, callback) }
}

export function emitBillingEvent(event: string, data: any) {
  const s = getSocket()
  if (s.connected) {
    s.emit(event, data)
  }
}
