import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

// Connection pool options
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Log db connection events
pool.on('connect', () => {
  console.log('[Database] New client connected to PostgreSQL pool');
});

pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client:', err.stack);
});

export const query = (text, params) => pool.query(text, params);

export default pool;
