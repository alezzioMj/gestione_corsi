import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// pool di connessioni configurato per il cloud
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true // Fondamentale per Supabase/Render
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });