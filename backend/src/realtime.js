import { Server } from 'socket.io';
import { config } from './config.js';

/** @type {import('socket.io').Server | null} */
let ioRef = null;

export function getIo() {
  return ioRef;
}

export function attachRealtime(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins.length ? config.corsOrigins : true,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  ioRef = io;
  let live = 0;

  io.on('connection', (socket) => {
    live += 1;
    io.emit('dashboard:live_users', { count: live });

    socket.on('disconnect', () => {
      live = Math.max(0, live - 1);
      io.emit('dashboard:live_users', { count: live });
    });
  });

  return io;
}
