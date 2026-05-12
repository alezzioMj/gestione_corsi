// backend/src/prisma.ts (o dove tieni il client)
import { PrismaClient } from "@prisma/client";

// Inizializzazione pulita, Prisma cercherà DATABASE_URL da solo
export const prisma = new PrismaClient();