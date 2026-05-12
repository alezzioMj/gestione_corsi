"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sedeSchema = void 0;
const zod_1 = require("zod");
exports.sedeSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1).max(150),
    indirizzo: zod_1.z.string().min(1).max(150),
    civico: zod_1.z.string().min(1).max(20),
    cap: zod_1.z.string().regex(/^\d{5}$/, "CAP non valido"),
    citta: zod_1.z.string().min(1).max(100),
    provincia: zod_1.z.string().length(2),
    descrizione: zod_1.z.string().nullish(),
    created_by: zod_1.z.string().nullish(),
});
