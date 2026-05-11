import { z } from "zod";

export const docenteSchema = z.object({
  codice_fiscale: z
    .string()
    .toUpperCase()
    .length(16, "Il codice fiscale deve avere 16 caratteri")
    .regex(/^[A-Z0-9]+$/, "Codice fiscale non valido"),

  nome: z
    .string()
    .min(1, "Il nome è obbligatorio")
    .max(100, "Il nome può avere massimo 100 caratteri"),

  cognome: z
    .string()
    .min(1, "Il cognome è obbligatorio")
    .max(100, "Il cognome può avere massimo 100 caratteri"),

  datanascita: z.coerce.date(),

  nazione: z
    .string()
    .min(1, "La nazione è obbligatoria")
    .max(100),

  regione: z
    .string()
    .min(1, "La regione è obbligatoria")
    .max(100),

  provincia: z
    .string()
    .min(1, "La provincia è obbligatoria")
    .max(100),

  comune: z
    .string()
    .min(1, "Il comune è obbligatorio")
    .max(100),

  sesso: z.enum(["M", "F", "Altro"], {
    error: () => ({ message: "Il sesso deve essere M, F o Altro" }),
  }),

  cellulare: z
    .string()
    .regex(/^[0-9+\s]+$/, "Numero di cellulare non valido"),

  mail: z
    .email("Indirizzo email non valido"),

  cv: z
    .string()
    .max(255, "Il campo CV è troppo lungo")
    .optional(),

  contratto: z
    .string()
    .min(1, "Il contratto è obbligatorio")
    .max(255),
});