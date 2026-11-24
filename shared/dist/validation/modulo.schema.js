"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateModuloSchema = exports.createModuloSchema = exports.moduloSchema = void 0;
const zod_1 = require("zod");
exports.moduloSchema = zod_1.z.object({
    id: zod_1.z.number(),
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
    created_at: zod_1.z.coerce.date()
});
exports.createModuloSchema = exports.moduloSchema.omit({
    id: true,
    created_at: true
});
exports.updateModuloSchema = exports.moduloSchema.partial().required({ id: true });
