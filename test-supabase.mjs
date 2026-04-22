import pg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pg;
dotenv.config({ path: 'packages/backend/.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query('SELECT NOW(), version()');
    console.log('✅ Connected to Supabase!');
    console.log('Time:', result.rows[0].now);
    console.log('PostgreSQL:', result.rows[0].version.split(',')[0]);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await pool.end();
  }
})();
