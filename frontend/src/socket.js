import { io } from 'socket.io-client';
import { resolveSocketOrigin } from './utils/url';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(resolveSocketOrigin(), {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}
