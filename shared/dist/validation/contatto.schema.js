"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contattoSchema = void 0;
const zod_1 = require("zod");
exports.contattoSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    sede_id: zod_1.z.number().int(),
    nome: zod_1.z.string().max(150),
    email: zod_1.z.email().max(255).nullable().optional(),
    telefono: zod_1.z.string().max(30).nullable().optional(),
});
