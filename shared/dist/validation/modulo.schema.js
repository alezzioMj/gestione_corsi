"use strict";
// shared/validation/modulo.schema.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateModuloSchema = exports.createModuloSchema = exports.moduloSchema = exports.booleanFromForm = exports.COMPETENZE = void 0;
const zod_1 = require("zod");
exports.COMPETENZE = ["Teorica", "Trasversale", "Pratica"];
exports.booleanFromForm = zod_1.z
    .union([zod_1.z.boolean(), zod_1.z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true");
exports.moduloSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    titolo: zod_1.z
        .string()
        .trim()
        .min(1, "Il titolo è obbligatorio")
        .max(150, "Il titolo può avere massimo 150 caratteri"),
    n_ore: zod_1.z.coerce.number().int().positive().nullable(), // n_ore Int? @default(4) nel modello Prisma
    competenza: zod_1.z.enum(exports.COMPETENZE),
    descrizione: zod_1.z.string().nullable(),
    multiplo: exports.booleanFromForm,
    created_at: zod_1.z.coerce.date(),
    created_by: zod_1.z.string().max(100).nullable(),
});
// i default stanno solo in create: nel partial() di update si riapplicherebbero (Zod 4)
exports.createModuloSchema = exports.moduloSchema
    .omit({ id: true, created_at: true, created_by: true })
    .extend({
    n_ore: zod_1.z.coerce.number().int().positive().optional(), // se manca, vale il default del database (4)
    descrizione: zod_1.z.string().nullish(),
    multiplo: exports.booleanFromForm.default(false),
});
exports.updateModuloSchema = exports.moduloSchema
    .omit({ id: true, created_at: true, created_by: true })
    .partial();
