"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.programmaModuliInputSchema = exports.programmaModuloInputSchema = exports.programmaModuloSchema = exports.updateProgrammaSchema = exports.createProgrammaSchema = exports.programmaSchema = void 0;
const zod_1 = require("zod");
exports.programmaSchema = zod_1.z.object({
    id: zod_1.z.number(),
    titolo: zod_1.z.string().min(1).max(150),
    descrizione: zod_1.z.string().nullish(),
    durata_totale: zod_1.z.number().int().positive(),
    ore_pratiche: zod_1.z.number().int().nonnegative(),
    ore_teoriche: zod_1.z.number().int().nonnegative(),
    ore_trasversali: zod_1.z.number().int().nonnegative(),
    created_at: zod_1.z.coerce.date(),
    created_by: zod_1.z.string().max(100).nullable(),
});
exports.createProgrammaSchema = exports.programmaSchema.omit({
    id: true,
    created_at: true,
    created_by: true,
});
exports.updateProgrammaSchema = exports.createProgrammaSchema.partial();
// ---- tabella di collegamento gestita dal programma ----
exports.programmaModuloSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    programma_id: zod_1.z.number().int().positive(),
    modulo_id: zod_1.z.number().int().positive(),
    ordine: zod_1.z.number().int().min(1),
    obbligatorio: zod_1.z.boolean(),
    n_ripetizioni: zod_1.z.number().int().min(1),
});
exports.programmaModuloInputSchema = exports.programmaModuloSchema.omit({
    id: true,
    programma_id: true,
});
exports.programmaModuliInputSchema = zod_1.z
    .array(exports.programmaModuloInputSchema)
    .superRefine((righe, ctx) => {
    const visti = new Set();
    righe.forEach((riga, i) => {
        if (visti.has(riga.ordine)) {
            ctx.addIssue({
                code: "custom",
                path: [i, "ordine"],
                message: "Ordine duplicato",
            });
        }
        visti.add(riga.ordine);
    });
});
