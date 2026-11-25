"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSedeClienteSchema = exports.createSedeClienteSchema = exports.sedeClienteSchema = exports.TIPI_SEDE_CLIENTE = void 0;
const zod_1 = require("zod");
exports.TIPI_SEDE_CLIENTE = ["LEGALE", "OPERATIVA"];
exports.sedeClienteSchema = zod_1.z.object({
    id: zod_1.z.number(),
    cliente_id: zod_1.z.number(),
    tipo: zod_1.z.enum(exports.TIPI_SEDE_CLIENTE),
    nome: zod_1.z.string().nullish(), // nome String? nel modello Prisma
    indirizzo: zod_1.z.string().min(1),
    civico: zod_1.z.string().min(1),
    cap: zod_1.z.string().min(1),
    citta: zod_1.z.string().min(1),
    provincia: zod_1.z.string().min(1),
});
exports.createSedeClienteSchema = exports.sedeClienteSchema
    .omit({ id: true })
    .extend({ tipo: zod_1.z.enum(exports.TIPI_SEDE_CLIENTE).default("OPERATIVA") });
exports.updateSedeClienteSchema = exports.sedeClienteSchema
    .omit({ id: true })
    .partial();
