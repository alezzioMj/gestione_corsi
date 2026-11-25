"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSessioneSchema = exports.createSessioneSchema = exports.sessioneSchema = exports.STATI_SESSIONE = void 0;
const zod_1 = require("zod");
const common_schema_1 = require("./common.schema");
exports.STATI_SESSIONE = ["Bozza", "Confermata", "Annullata", "Completata"];
exports.sessioneSchema = zod_1.z.object({
    id: zod_1.z.number(),
    corso_id: zod_1.z.number().int().positive(),
    docente_cf: zod_1.z.string().length(16).nullable(), // docente_cf String? nel modello Prisma
    modulo_id: zod_1.z.number().int().positive(),
    sede_id: zod_1.z.number().int().positive(),
    aula_id: zod_1.z.number().int().positive().nullable(), // aula_id Int? nel modello Prisma
    data: zod_1.z.coerce.date(),
    ora_inizio: common_schema_1.orarioSchema,
    ora_fine: common_schema_1.orarioSchema,
    stato: zod_1.z.enum(exports.STATI_SESSIONE).nullable(), // stato Enum? @default(Bozza) nel modello Prisma
    priorita: zod_1.z.number().int().min(0),
    note: zod_1.z.string().nullish(),
    created_at: zod_1.z.coerce.date(),
    created_by: zod_1.z.string().max(100).nullable(),
});
const orarioValido = (d) => !d.ora_inizio || !d.ora_fine || d.ora_fine > d.ora_inizio;
const orarioMsg = { message: "ora_fine deve essere successiva a ora_inizio", path: ["ora_fine"] };
// Base degli input: docente e aula facoltativi, stato obbligatorio solo se presente
const sessioneInputSchema = exports.sessioneSchema
    .omit({ id: true, created_at: true, created_by: true })
    .extend({
    docente_cf: zod_1.z.string().length(16).nullish(),
    aula_id: zod_1.z.number().int().positive().nullish(),
    stato: zod_1.z.enum(exports.STATI_SESSIONE),
});
// Il default sta solo in create: nel partial() di update si riapplicherebbe (Zod 4)
// e ogni modifica riporterebbe la sessione a "Bozza".
exports.createSessioneSchema = sessioneInputSchema
    .extend({ stato: zod_1.z.enum(exports.STATI_SESSIONE).default("Bozza") })
    .refine(orarioValido, orarioMsg);
exports.updateSessioneSchema = sessioneInputSchema
    .partial()
    .refine(orarioValido, orarioMsg);
