"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docenteSchema = void 0;
const zod_1 = require("zod");
exports.docenteSchema = zod_1.z.object({
    codice_fiscale: zod_1.z
        .string()
        .toUpperCase()
        .length(16, "Il codice fiscale deve avere 16 caratteri")
        .regex(/^[A-Z0-9]+$/, "Codice fiscale non valido"),
    nome: zod_1.z
        .string()
        .min(1, "Il nome è obbligatorio")
        .max(100, "Il nome può avere massimo 100 caratteri"),
    cognome: zod_1.z
        .string()
        .min(1, "Il cognome è obbligatorio")
        .max(100, "Il cognome può avere massimo 100 caratteri"),
    datanascita: zod_1.z.coerce.date(),
    nazione: zod_1.z
        .string()
        .min(1, "La nazione è obbligatoria")
        .max(100),
    regione: zod_1.z
        .string()
        .min(1, "La regione è obbligatoria")
        .max(100),
    provincia: zod_1.z
        .string()
        .min(1, "La provincia è obbligatoria")
        .max(100),
    comune: zod_1.z
        .string()
        .min(1, "Il comune è obbligatorio")
        .max(100),
    sesso: zod_1.z.enum(["M", "F", "Altro"], {
        error: () => ({ message: "Il sesso deve essere M, F o Altro" }),
    }),
    cellulare: zod_1.z
        .string()
        .regex(/^[0-9+\s]+$/, "Numero di cellulare non valido"),
    mail: zod_1.z
        .email("Indirizzo email non valido"),
    cv: zod_1.z
        .string()
        .max(255, "Il campo CV è troppo lungo")
        .optional(),
    contratto: zod_1.z
        .string()
        .min(1, "Il contratto è obbligatorio")
        .max(255),
});
