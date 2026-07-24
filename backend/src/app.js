import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import reportRoutes from './routes/reportRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());

// Basic health check route
app.use('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Farmer payment register API server is running',
    timestamp: new Date().toISOString()
  });
});

// Mounted API routes
app.use('/api/reports', reportRoutes);

// Placeholder for API routes (Phase 7 Routes Mapping)
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global error handler middleware
app.use(errorHandler);

export default app;
