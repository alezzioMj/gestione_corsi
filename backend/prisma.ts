import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// 1. Recuperiamo la stringa (assicurati che su Render sia settata!)
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.pjmvswjocakqkptobrta:ed2%2F_%25%2Bp9R75uP%2B@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?schema=public&sslmode=disable";

// 2. Creiamo il Pool di connessioni
const pool = new Pool({ 
  connectionString,
  ssl: process.env.DATABASE_URL?.includes("render.com") ? { rejectUnauthorized: false } : false,
});

// 3. Creiamo l'adapter
const adapter = new PrismaPg(pool);

// 4. Inizializziamo il client passando l'adapter CORRETTAMENTE
// Nota: L'errore diceva che l'oggetto era vuoto, qui lo passiamo esplicitamente.
export const prisma = new PrismaClient({ adapter: adapter });