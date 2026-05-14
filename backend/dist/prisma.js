"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const { Pool } = pg_1.default;
// 1. Recuperiamo la stringa (assicurati che su Render sia settata!)
const connectionString = process.env.DATABASE_URL;
// 2. Creiamo il Pool di connessioni
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});
// 3. Creiamo l'adapter
const adapter = new adapter_pg_1.PrismaPg(pool);
// 4. Inizializziamo il client passando l'adapter CORRETTAMENTE
// Nota: L'errore diceva che l'oggetto era vuoto, qui lo passiamo esplicitamente.
exports.prisma = new client_1.PrismaClient({ adapter: adapter });
