import { io, Socket } from 'socket.io-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const viteEnv: any = (import.meta as any).env || {};
const API_BASE_URL = viteEnv.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

function getSocketUrl() {
  try {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'http://localhost:3000';
  }
}

let testSocket: Socket | null = null;

export function getTestSocket(): Socket {
  if (testSocket && testSocket.connected) return testSocket;
  if (testSocket) {
    testSocket.removeAllListeners();
    testSocket.disconnect();
  }
  testSocket = io(getSocketUrl(), {
    transports: ['websocket'],
    // No auth — test room is public
  });
  return testSocket;
}

export function disconnectTestSocket() {
  if (testSocket) {
    testSocket.removeAllListeners();
    testSocket.disconnect();
    testSocket = null;
  }
}
