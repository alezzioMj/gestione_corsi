"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAulaSchema = exports.createAulaSchema = exports.aulaSchema = void 0;
const zod_1 = require("zod");
exports.aulaSchema = zod_1.z.object({
    id: zod_1.z.number(),
    nome: zod_1.z.string().max(100),
    sede_id: zod_1.z.number(),
    capienza: zod_1.z.number(),
    descrizione: zod_1.z.string().optional()
});
exports.createAulaSchema = exports.aulaSchema.omit({ id: true });
exports.updateAulaSchema = exports.aulaSchema.partial().required({ id: true });
