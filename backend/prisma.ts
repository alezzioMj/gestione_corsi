import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// Debug: questo aiuterà a vedere nei log di Render se la stringa esiste (oscurata)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERRORE: DATABASE_URL non trovata nelle variabili d'ambiente!");
}

const pool = new Pool({ 
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Permette la connessione SSL su Supabase senza certificati locali
  }
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });