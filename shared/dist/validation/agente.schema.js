"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAgenteSchema = exports.createAgenteSchema = exports.agenteInputSchema = exports.agenteSchema = void 0;
const zod_1 = require("zod");
exports.agenteSchema = zod_1.z.object({
    id: zod_1.z.number(),
    nome: zod_1.z.string().trim().min(1).max(100),
    cognome: zod_1.z.string().trim().min(1).max(100),
    email: zod_1.z.email().max(255).nullish(),
    telefono: zod_1.z.string().max(30).nullish(),
});
// agente completo: con id = esistente (collega), senza id = nuovo (crea)
exports.agenteInputSchema = exports.agenteSchema
    .omit({ id: true })
    .extend({ id: zod_1.z.number().int().positive().optional() });
exports.createAgenteSchema = exports.agenteSchema.omit({ id: true });
exports.updateAgenteSchema = exports.createAgenteSchema.partial();
