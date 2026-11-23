// shared/validation/docente.schema.ts

import { z } from "zod";
import { DOCENTE_COLORS } from "../constants/docente";
import type { CorsoDocenteWithRelations } from "./corso.schema";
import type { Modulo } from "./modulo.schema";

export const docenteSchema = z.object({
    codice_fiscale: z
        .string()
        .trim()
        .toUpperCase()
        .length(16, "Il codice fiscale deve avere 16 caratteri")
        .regex(/^[A-Z0-9]+$/, "Codice fiscale non valido"),

    nome: z
        .string()
        .min(1, "Il nome è obbligatorio")
        .max(100, "Il nome può avere massimo 100 caratteri"),

    colore: z.enum(DOCENTE_COLORS),

    cognome: z
        .string()
        .min(1, "Il cognome è obbligatorio")
        .max(100, "Il cognome può avere massimo 100 caratteri"),

    datanascita: z.coerce.date(),

    nazione: z
        .string()
        .min(1, "La nazione è obbligatoria")
        .max(100, "La nazione può avere massimo 100 caratteri"),

    regione: z
        .string()
        .min(1, "La regione è obbligatoria")
        .max(100, "La regione può avere massimo 100 caratteri"),

    provincia: z
        .string()
        .min(1, "La provincia è obbligatoria")
        .max(100, "La provincia può avere massimo 100 caratteri"),

    comune: z
        .string()
        .min(1, "Il comune è obbligatorio")
        .max(100, "Il comune può avere massimo 100 caratteri"),

    sesso: z.enum(["M", "F", "Altro"], {
        error: "Il sesso deve essere M, F o Altro",
    }),

    cellulare: z
        .string()
        .max(20, "Il numero può avere massimo 20 caratteri")
        .regex(/^[0-9+\s]+$/, "Numero di cellulare non valido"),

    mail: z
        .email("Indirizzo email non valido")
        .max(100, "L'email può avere massimo 100 caratteri"),

    cv: z
        .string()
        .max(255, "Il campo CV è troppo lungo"),

    contratto: z
        .string()
        .min(1, "Il contratto è obbligatorio")
        .max(100, "Il contratto può avere massimo 100 caratteri"),

    created_at: z.coerce.date(),
    created_by: z.string().max(100).nullable(),
});

export const createDocenteSchema = docenteSchema.omit({
    created_at: true,
    created_by: true,
});

export const updateDocenteSchema = createDocenteSchema
    .omit({ codice_fiscale: true })
    .partial();

export type DocenteModulo = { docente_cf: string; modulo_id: number };

type DocenteModuloRelations = { docente: Docente; modulo: Modulo };

export type DocenteModuloWithRelations<K extends keyof DocenteModuloRelations = never> =
    DocenteModulo & Pick<DocenteModuloRelations, K>;

// Allineato a INCLUDE_MAP di docenteController
type DocenteRelations = {
    docente_modulo: DocenteModuloWithRelations<"modulo">[];
    corso_docente: CorsoDocenteWithRelations<"corso">[];
};

export type DocenteWithRelations<K extends keyof DocenteRelations = never> =
    Docente & Pick<DocenteRelations, K>;

export type Docente = z.infer<typeof docenteSchema>;
export type CreateDocente = z.infer<typeof createDocenteSchema>;
export type UpdateDocente = z.infer<typeof updateDocenteSchema>;
