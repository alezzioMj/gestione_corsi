"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:password123@localhost:5432/gestione_corsi",
});
exports.prisma = new client_1.PrismaClient({ adapter });
