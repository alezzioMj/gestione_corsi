"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIndisponibilitaSchema = exports.createIndisponibilitaSchema = exports.indisponibilitaSchema = void 0;
const zod_1 = require("zod");
const common_schema_1 = require("./common.schema");
exports.indisponibilitaSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    docente_cf: zod_1.z.string().length(16, "Il codice fiscale deve avere 16 caratteri").nullish(),
    sede_id: zod_1.z.number().int().nullish(),
    aula_id: zod_1.z.number().int().nullish(),
    data_inizio: zod_1.z.coerce.date(),
    data_fine: zod_1.z.coerce.date(),
    ora_inizio: common_schema_1.orarioSchema,
    ora_fine: common_schema_1.orarioSchema,
    causale: zod_1.z.string().min(1, "La causale è obbligatoria").max(100),
    descrizione: zod_1.z.string().nullish(),
});
// controlla la coerenza solo quando tutti i campi sono presenti (in update possono mancare)
const intervalloValido = (d, ctx) => {
    if (!d.data_inizio || !d.data_fine || !d.ora_inizio || !d.ora_fine)
        return;
    const inizio = new Date(d.data_inizio);
    const fine = new Date(d.data_fine);
    const [oreInizio, minutiInizio] = d.ora_inizio.split(":").map(Number);
    const [oreFine, minutiFine] = d.ora_fine.split(":").map(Number);
    inizio.setHours(oreInizio, minutiInizio, 0, 0);
    fine.setHours(oreFine, minutiFine, 0, 0);
    if (fine.getTime() <= inizio.getTime()) {
        ctx.addIssue({
            code: "custom",
            path: ["data_fine"],
            message: "La data e l'ora di fine devono essere successive a quelle di inizio",
        });
    }
};
const indisponibilitaInputSchema = exports.indisponibilitaSchema.omit({ id: true });
exports.createIndisponibilitaSchema = indisponibilitaInputSchema.superRefine(intervalloValido);
exports.updateIndisponibilitaSchema = indisponibilitaInputSchema
    .partial()
    .superRefine(intervalloValido);
