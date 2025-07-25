import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

// Use correct Supabase connection string
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.pirlystitqckdhtgvqhb:Brillius@123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

// Override with correct connection string if environment variable is outdated
const connectionString = DATABASE_URL.includes("aws-0-ap-south-1.pooler.supabase.com") 
  ? DATABASE_URL 
  : "postgresql://postgres.pirlystitqckdhtgvqhb:Brillius@123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

export const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
export const db = drizzle(pool, { schema });