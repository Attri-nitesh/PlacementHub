const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');
const { initGmailSyncJob } = require('./jobs/gmailSyncJob');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5001;

// Create HTTP Server & attach Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
});

// Socket.IO event connection handler
io.on('connection', (socket) => {
  console.log(`⚡ [Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_rooms', ({ userId, role }) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`⚡ [Socket.IO] User ${userId} joined room user:${userId}`);
    }
    if (role) {
      socket.join(`role:${role}`);
      console.log(`⚡ [Socket.IO] User joined room role:${role}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`⚡ [Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Store io instance on app for controllers & services to use
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 PlacementHub Backend Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode (Unified Socket.IO Engine)`);

  // Initialize Automatic Gmail Sync Scheduler ONCE on server startup
  initGmailSyncJob(io);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
  server.close(() => process.exit(1));
});
