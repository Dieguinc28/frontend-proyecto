import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      // WebSocket conectado
    });

    socket.on('disconnect', () => {
      // WebSocket desconectado
    });

    socket.on('connect_error', () => {
      // Error de conexión WebSocket - se reintentará automáticamente
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
