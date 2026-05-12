import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// 1. Recuperiamo la stringa (assicurati che su Render sia settata!)
const connectionString = process.env.DATABASE_URL;

// 2. Creiamo il Pool di connessioni
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } 
});

// 3. Creiamo l'adapter
const adapter = new PrismaPg(pool);

// 4. Inizializziamo il client passando l'adapter CORRETTAMENTE
// Nota: L'errore diceva che l'oggetto era vuoto, qui lo passiamo esplicitamente.
export const prisma = new PrismaClient({ adapter: adapter });