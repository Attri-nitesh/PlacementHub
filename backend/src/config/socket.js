const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  // JWT Middleware for Socket connection authorization
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token is required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'placementhub_secret_key');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid credentials'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id} (User: ${socket.user.name}, Role: ${socket.user.role})`);

    // Join room specific to this user ID for target alerts
    socket.join(`user:${socket.user._id}`);

    // Join room specific to their role (e.g. students, recruiters, admins)
    socket.join(`role:${socket.user.role}`);

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

// Dispatch helper to push sockets to rooms
const emitSocketNotification = (recipientId, event, data) => {
  if (!io) {
    console.warn('Socket.io server not initialized');
    return;
  }
  if (recipientId) {
    io.to(`user:${recipientId}`).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitSocketNotification
};
