import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import initializeDatabase from './config/database';
import { createAuthRoutes } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'nexus.db');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const db = initializeDatabase(DB_PATH);

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', createAuthRoutes(db));

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
