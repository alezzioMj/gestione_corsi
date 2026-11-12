"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduloSchema = void 0;
const zod_1 = require("zod");
exports.moduloSchema = zod_1.z.object({
    titolo: zod_1.z.string().min(1).max(150),
    n_ore: zod_1.z.number().int().positive(),
    competenza: zod_1.z.enum([
        "Pratica",
        "Teorica",
        "Trasversale"
    ]),
    multiplo: zod_1.z.boolean(),
    descrizione: zod_1.z.string().optional(),
    created_by: zod_1.z.string().max(100).optional(),
});
