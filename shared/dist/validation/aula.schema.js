"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAulaSchema = exports.createAulaSchema = exports.aulaSchema = void 0;
const zod_1 = require("zod");
exports.aulaSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    nome: zod_1.z.string().min(1).max(100),
    sede_id: zod_1.z.number().int(),
    capienza: zod_1.z.number().int().nonnegative().nullable(),
    descrizione: zod_1.z.string().nullable(),
});
exports.createAulaSchema = exports.aulaSchema
    .omit({ id: true })
    .extend({
    capienza: zod_1.z.number().int().nonnegative().nullish(),
    descrizione: zod_1.z.string().nullish(),
});
exports.updateAulaSchema = exports.aulaSchema.omit({ id: true }).partial();
