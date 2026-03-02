/**
 * Aura Wellness Platform - Backend Server
 *
 * Express.js server with MongoDB, JWT auth, and comprehensive API.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { apiRouter } from './routes/api';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// API routes
app.use('/api/v1', rateLimiter, apiRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected');

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;
