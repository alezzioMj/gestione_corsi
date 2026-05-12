"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indisponibilitaSchema = void 0;
const zod_1 = require("zod");
exports.indisponibilitaSchema = zod_1.z.object({
    tipologia: zod_1.z.enum(["DOCENTE", "SEDE", "AULA"]),
    docente_cf: zod_1.z.string()
        .length(16, "Il codice fiscale deve avere 16 caratteri")
        .optional(),
    sede_id: zod_1.z.number().optional(),
    aula_id: zod_1.z.number().optional(),
    data_inizio: zod_1.z.coerce.date(),
    data_fine: zod_1.z.coerce.date(),
    ora_inizio: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    ora_fine: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    causale: zod_1.z.string()
        .min(1, "La causale è obbligatoria")
        .max(100),
    descrizione: zod_1.z.string().optional(),
})
    .superRefine((data, ctx) => {
    if (data.data_fine < data.data_inizio) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["data_fine"],
            message: "La data fine deve essere successiva o uguale alla data inizio",
        });
    }
    if (data.ora_fine <= data.ora_inizio) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["ora_fine"],
            message: "L'ora fine deve essere successiva all'ora inizio",
        });
    }
    if (data.tipologia === "DOCENTE" && !data.docente_cf) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["docente_cf"],
            message: "docente_cf obbligatorio per tipologia DOCENTE",
        });
    }
    if (data.tipologia === "SEDE" && !data.sede_id) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["sede_id"],
            message: "sede_id obbligatorio per tipologia SEDE",
        });
    }
    if (data.tipologia === "AULA" && !data.aula_id) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["aula_id"],
            message: "aula_id obbligatorio per tipologia AULA",
        });
    }
});
