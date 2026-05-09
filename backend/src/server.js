import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import passport from './config/passport.js';
import config from './config/config.js';
import sequelize from './database/sequelize.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { setupSocketHandlers } from './sockets/index.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// API routes
app.use('/api', routes);

// Socket.IO connection handling
setupSocketHandlers(io);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database models
    await sequelize.sync({ alter: config.nodeEnv === 'development' });
    console.log('Database models synchronized.');

    // Start HTTP server
    httpServer.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await sequelize.close();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();

export { app, httpServer, io, sequelize };
