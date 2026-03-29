import { io, Socket } from 'socket.io-client';
import { loadTokenFromStorage } from './apiClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const viteEnv: any = (import.meta as any).env || {};
const API_BASE_URL = viteEnv.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Derive Socket URL from API base (strip /api/v1)
function getSocketUrl() {
  try {
    const url = new URL(API_BASE_URL);
    // Remove "/api/v1"
    const origin = `${url.protocol}//${url.host}`;
    return origin;
  } catch {
    return 'http://localhost:3000';
  }
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;
  const token = loadTokenFromStorage();
  socket = io(getSocketUrl(), {
    transports: ['websocket'],
    auth: token ? { token } : undefined,
  });
  return socket;
}

