"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommessaSchema = exports.createCommessaSchema = exports.commessaSchema = exports.STATI_COMMESSA = void 0;
const zod_1 = require("zod");
exports.STATI_COMMESSA = ["APERTA", "IN_CORSO", "CHIUSA", "ANNULLATA"];
exports.commessaSchema = zod_1.z.object({
    id: zod_1.z.number(),
    codice_commessa: zod_1.z
        .string()
        .trim()
        .min(1, "Il codice commessa è obbligatorio")
        .max(255, "Il codice commessa può avere massimo 255 caratteri"),
    codice_ft: zod_1.z.string().max(255).nullable(),
    codice_rlom: zod_1.z.string().max(255).nullable(),
    descrizione: zod_1.z.string().nullable(),
    scadenza: zod_1.z.coerce.date().nullable(),
    cliente_id: zod_1.z.number().nullable(),
    stato: zod_1.z.enum(exports.STATI_COMMESSA),
    created_at: zod_1.z.coerce.date(),
    created_by: zod_1.z.string().max(100).nullable(),
});
// il default di stato sta solo in create: nel partial() di update si riapplicherebbe (Zod 4)
exports.createCommessaSchema = exports.commessaSchema
    .omit({ id: true, created_at: true, created_by: true })
    .extend({
    codice_ft: zod_1.z.string().max(255).nullish(),
    codice_rlom: zod_1.z.string().max(255).nullish(),
    descrizione: zod_1.z.string().nullish(),
    scadenza: zod_1.z.coerce.date().nullish(),
    cliente_id: zod_1.z.number().nullish(),
    stato: zod_1.z.enum(exports.STATI_COMMESSA).default("APERTA"),
});
exports.updateCommessaSchema = exports.commessaSchema
    .omit({ id: true, created_at: true, created_by: true })
    .partial();
