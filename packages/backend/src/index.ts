import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import initializeDatabase from './config/database';
import { createCompressionMiddleware, createCompressionMetricsMiddleware } from './middleware/compression.middleware';
import { initializeCache } from './services/cache.service';
import { initializeTokenBlacklist } from './services/tokenBlacklist.service';
import { appContext } from './context';
import { createAuthRoutes } from './routes/auth';
import { createProfilesRoutes } from './routes/profiles';
import { createCompetitorsRoutes } from './routes/competitors';
import { createAssetsRoutes } from './routes/assets';
import { createContentRoutes } from './routes/content';
import { createResearchRoutes } from './routes/research';
import { createAnalyticsRoutes } from './routes/analytics';
import { createSearchRoutes } from './routes/search';
import { createGenerationRoutes } from './routes/generation';
import { createVisualGenerationRoutes } from './routes/visual-generation';
import { createCarouselRoutes } from './routes/carousel';
import { createStoryRoutes } from './routes/story';
import { createHashtagRoutes } from './routes/hashtags';
import { createWorkflowRoutes } from './routes/workflow';
import { createAutopilotRoutes } from './routes/autopilot';
import { createSchedulingRoutes } from './routes/scheduling';
import { createQueueRoutes } from './routes/queue';
import { createOptimizationRoutes } from './routes/optimization';
import { createDashboardRoutes } from './routes/dashboard';
import { createReportsRoutes } from './routes/reports';

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

// Initialize cache service
const cache = initializeCache({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  ttlSeconds: {
    profiles: 5 * 60, // 5 minutes
    content: 60 * 60, // 1 hour
    default: 10 * 60, // 10 minutes
  },
});

// Initialize token blacklist service (Redis with in-memory fallback)
initializeTokenBlacklist(
  process.env.REDIS_HOST || 'localhost',
  parseInt(process.env.REDIS_PORT || '6379')
);

// Compression middleware (gzip all responses > 1KB)
app.use(createCompressionMiddleware());
app.use(createCompressionMetricsMiddleware());

// Security Headers Middleware
app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Content Security Policy: Restrict script/style sources to self + necessary CDNs
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:"
  );

  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Force HTTPS (HSTS: 1 year including subdomains)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // XSS protection (deprecated but good fallback for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer behavior
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable dangerous browser features
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  next();
});

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

// Register database and cache in app context
appContext.setDatabase(db);
appContext.setCache(cache);

// Initialize PostgreSQL connection pool asynchronously
import { initializeDatabase as initializePgConnection } from './db/connection';
initializePgConnection().catch(err => {
  console.error('❌ Failed to initialize PostgreSQL connection pool:', err);
  process.exit(1);
});

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', createAuthRoutes(db, loginLimiter));
app.use('/api/profiles', createProfilesRoutes(db));
app.use('/api/profiles/:profileId/competitors', createCompetitorsRoutes(db));
app.use('/api/profiles/:profileId/assets', createAssetsRoutes(db));
app.use('/api/profiles/:profileId/autopilot', createAutopilotRoutes(db));
app.use('/api', createSchedulingRoutes(db));
app.use('/api', createQueueRoutes(db));
app.use('/api/content', createContentRoutes(db));
app.use('/api/content', createResearchRoutes(db));
app.use('/api/content', createGenerationRoutes(db));
app.use('/api/content', createWorkflowRoutes(db));
app.use('/api/visual', createVisualGenerationRoutes(db));
app.use('/api/visual', createCarouselRoutes(db));
app.use('/api/visual', createStoryRoutes(db));
app.use('/api/content', createHashtagRoutes(db));
app.use('/api/analytics', createAnalyticsRoutes(db));
app.use('/api/dashboard', createDashboardRoutes(db));
app.use('/api/reports', createReportsRoutes(db));
app.use('/api/search', createSearchRoutes(db));
app.use('/api', createOptimizationRoutes(db));

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
