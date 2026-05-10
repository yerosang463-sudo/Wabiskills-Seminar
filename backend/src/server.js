import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import passport from './config/passport.js';
import config from './config/config.js';
import sequelize from './database/sequelize.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { setupSocketHandlers } from './sockets/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveFrontendDist() {
  const candidates = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'index.html'))) return dir;
  }
  return null;
}

const frontendDist = resolveFrontendDist();
const canServeFrontend = Boolean(frontendDist);
if (!canServeFrontend) {
  console.warn(
    '[SPA] frontend/dist/index.html not found. Deep links like /room/:id will 404 on this server. Build the frontend during deploy. Tried:',
    [
      path.resolve(__dirname, '../../frontend/dist'),
      path.resolve(process.cwd(), '../frontend/dist'),
      path.resolve(process.cwd(), 'frontend/dist'),
    ].join(', '),
  );
} else {
  console.log('[SPA] Serving React app from', frontendDist);
}

const app = express();
app.set('trust proxy', 1);
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
app.use(cookieParser());
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

// Single-host deploy: SPA from frontend/dist (/room/:id shares one origin with API + WebSocket)
if (canServeFrontend) {
  app.use(
    express.static(frontendDist, {
      fallthrough: true,
    }),
  );
  app.use((req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || req.originalUrl.startsWith('/api')) {
      return next();
    }
    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Database Repair & Migration Logic
    const repairDatabase = async () => {
      try {
        const queryInterface = sequelize.getQueryInterface();
        const tables = await queryInterface.showAllTables();
        const hasUsers = tables.some(t => t.toLowerCase() === 'users');

        if (hasUsers) {
          const tableName = tables.find(t => t.toLowerCase() === 'users');
          const columns = await queryInterface.describeTable(tableName);
          
          // If 'id' exists but is NOT auto-incrementing (or if we are missing columns), 
          // we might need a force recreation if the user is stuck.
          // In TiDB, we can't easily check auto_increment via describeTable in a cross-dialect way,
          // so we check if 'avatar' or 'googleId' are missing as a proxy for 'is this an old table?'.
          if (!columns.avatar || !columns.googleId) {
            console.log('Database schema is outdated. Recreating tables to ensure correct structure...');
            
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
            await sequelize.query('DROP TABLE IF EXISTS Messages');
            await sequelize.query('DROP TABLE IF EXISTS Rooms');
            await sequelize.query('DROP TABLE IF EXISTS Users');
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            
            // Re-syncing with the models will now create them correctly with AUTO_INCREMENT
            await sequelize.sync({ force: true });
            console.log('Database tables recreated successfully.');
          } else {
            console.log('Database schema appears up to date.');
          }
        } else {
          // If no tables exist, just sync them
          await sequelize.sync();
          console.log('Database tables created for the first time.');
        }
      } catch (error) {
        console.error('Database repair/migration failed:', error);
        // Fallback to normal sync if repair fails
        await sequelize.sync({ alter: config.nodeEnv === 'development' });
      }
    };

    await repairDatabase();

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
