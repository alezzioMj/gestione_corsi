"use strict";
// shared/validation/docente.schema.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocenteSchema = exports.createDocenteSchema = exports.docenteSchema = void 0;
const zod_1 = require("zod");
const docente_1 = require("../constants/docente");
exports.docenteSchema = zod_1.z.object({
    codice_fiscale: zod_1.z
        .string()
        .trim()
        .toUpperCase()
        .length(16, "Il codice fiscale deve avere 16 caratteri")
        .regex(/^[A-Z0-9]+$/, "Codice fiscale non valido"),
    nome: zod_1.z
        .string()
        .min(1, "Il nome è obbligatorio")
        .max(100, "Il nome può avere massimo 100 caratteri"),
    colore: zod_1.z.enum(docente_1.DOCENTE_COLORS),
    cognome: zod_1.z
        .string()
        .min(1, "Il cognome è obbligatorio")
        .max(100, "Il cognome può avere massimo 100 caratteri"),
    datanascita: zod_1.z.coerce.date(),
    nazione: zod_1.z
        .string()
        .min(1, "La nazione è obbligatoria")
        .max(100, "La nazione può avere massimo 100 caratteri"),
    regione: zod_1.z
        .string()
        .min(1, "La regione è obbligatoria")
        .max(100, "La regione può avere massimo 100 caratteri"),
    provincia: zod_1.z
        .string()
        .min(1, "La provincia è obbligatoria")
        .max(100, "La provincia può avere massimo 100 caratteri"),
    comune: zod_1.z
        .string()
        .min(1, "Il comune è obbligatorio")
        .max(100, "Il comune può avere massimo 100 caratteri"),
    sesso: zod_1.z.enum(["M", "F", "Altro"], {
        error: "Il sesso deve essere M, F o Altro",
    }),
    cellulare: zod_1.z
        .string()
        .max(20, "Il numero può avere massimo 20 caratteri")
        .regex(/^[0-9+\s]+$/, "Numero di cellulare non valido"),
    mail: zod_1.z
        .email("Indirizzo email non valido")
        .max(100, "L'email può avere massimo 100 caratteri"),
    cv: zod_1.z
        .string()
        .max(255, "Il campo CV è troppo lungo"),
    contratto: zod_1.z
        .string()
        .min(1, "Il contratto è obbligatorio")
        .max(100, "Il contratto può avere massimo 100 caratteri"),
    created_at: zod_1.z.coerce.date(),
    created_by: zod_1.z.string().max(100).nullable(),
});
exports.createDocenteSchema = exports.docenteSchema.omit({
    created_at: true,
    created_by: true,
});
exports.updateDocenteSchema = exports.createDocenteSchema
    .omit({ codice_fiscale: true })
    .partial();
