import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

export const createPool = () => {
  const isSsl = process.env.SQL_SSL === 'true' || process.env.SQL_HOST?.includes('supabase.co');
  
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isSsl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 15000,
    });
  }

  return new Pool({
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 15000,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
export { schema };
