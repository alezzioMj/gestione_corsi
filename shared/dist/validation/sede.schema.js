"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSedeSchema = exports.createSedeSchema = exports.sedeSchema = void 0;
const zod_1 = require("zod");
exports.sedeSchema = zod_1.z.object({
    id: zod_1.z.number(),
    nome: zod_1.z.string().min(1).max(150),
    indirizzo: zod_1.z.string().min(1).max(150),
    civico: zod_1.z.string().min(1).max(20),
    cap: zod_1.z.string().regex(/^\d{5}$/, "CAP non valido"),
    citta: zod_1.z.string().min(1).max(100),
    provincia: zod_1.z.string().length(2),
    descrizione: zod_1.z.string().nullish(),
    created_at: zod_1.z.coerce.date(),
    created_by: zod_1.z.string().max(100).nullable(),
});
exports.createSedeSchema = exports.sedeSchema.omit({
    id: true,
    created_at: true,
    created_by: true,
});
exports.updateSedeSchema = exports.createSedeSchema.partial();
