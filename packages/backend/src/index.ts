import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import initializeDatabase from './config/database';
import { createAuthRoutes } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'nexus.db');

// Middleware
// Configure CORS with whitelist (allow localhost for dev, configurable for prod)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// General rate limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth login rate limiter: 5 requests per 5 minutes per IP (per story security notes)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: 'Too many login attempts, please try again after 5 minutes',
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(generalLimiter);

// Initialize database
const db = initializeDatabase(DB_PATH);

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', createAuthRoutes(db, loginLimiter));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${DB_PATH}`);
});
