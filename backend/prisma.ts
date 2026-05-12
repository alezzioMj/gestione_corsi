import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password123@localhost:5432/gestione_corsi",
});
export const prisma = new PrismaClient({ adapter });