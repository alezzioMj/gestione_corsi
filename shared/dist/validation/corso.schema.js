"use strict";
// shared/validation/corso.schema.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsoDocenteInputSchema = exports.corsoDocenteSchema = exports.updateCorsoSchema = exports.createCorsoSchema = exports.corsoSchema = void 0;
const zod_1 = require("zod");
const common_schema_1 = require("./common.schema");
const corsoBaseSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    nome: zod_1.z.string().trim().min(1).max(150),
    descrizione: zod_1.z.string().nullable(),
    commessa_id: zod_1.z.number().int(),
    programma_id: zod_1.z.number().int().nullable(),
    n_ore: zod_1.z.number().int().positive().nullable(),
    inizio: zod_1.z.coerce.date().nullable(),
    fine: zod_1.z.coerce.date().nullable(),
    mattina_inizio: common_schema_1.orarioSchema,
    mattina_fine: common_schema_1.orarioSchema,
    pomeriggio_inizio: common_schema_1.orarioSchema,
    pomeriggio_fine: common_schema_1.orarioSchema,
    created_at: zod_1.z.coerce.date().nullable(),
    created_by: zod_1.z.string().max(100).nullable(),
});
const orari = (d, ctx) => {
    if (d.inizio && d.fine && d.fine < d.inizio)
        ctx.addIssue({ code: "custom", path: ["fine"], message: "La data fine deve essere successiva o uguale alla data inizio" });
    if (d.mattina_inizio && d.mattina_fine && d.mattina_fine <= d.mattina_inizio)
        ctx.addIssue({ code: "custom", path: ["mattina_fine"], message: "Fine mattina deve essere dopo l'inizio" });
    if (d.pomeriggio_inizio && d.pomeriggio_fine && d.pomeriggio_fine <= d.pomeriggio_inizio)
        ctx.addIssue({ code: "custom", path: ["pomeriggio_fine"], message: "Fine pomeriggio deve essere dopo l'inizio" });
};
exports.corsoSchema = corsoBaseSchema.superRefine(orari);
exports.createCorsoSchema = corsoBaseSchema
    .omit({ id: true, created_at: true, created_by: true })
    .extend({
    programma_id: zod_1.z.number().int(),
    n_ore: zod_1.z.number().int().positive(),
    inizio: zod_1.z.coerce.date(),
    fine: zod_1.z.coerce.date(),
    descrizione: zod_1.z.string().nullish(),
    docenti: zod_1.z.array(zod_1.z.string().length(16)),
    sedi: zod_1.z.array(zod_1.z.number().int()),
    giorniDisponibili: zod_1.z.array(zod_1.z.number().int().min(0).max(6)),
    ordine: zod_1.z.array(zod_1.z.object({
        modulo_id: zod_1.z.number().int(),
        ordine: zod_1.z.number().int().positive(),
    })),
})
    .superRefine(orari);
exports.updateCorsoSchema = corsoBaseSchema
    .omit({ id: true, created_at: true, created_by: true })
    .partial()
    .superRefine(orari);
// ---- tabelle di collegamento gestite dal corso ----
exports.corsoDocenteSchema = zod_1.z.object({
    corso_id: zod_1.z.number().int().positive(),
    docente_cf: zod_1.z.string().length(16),
    n_ore: zod_1.z.number().int().positive().nullable(),
});
exports.corsoDocenteInputSchema = exports.corsoDocenteSchema.omit({ corso_id: true });
