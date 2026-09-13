import { z } from "zod";

export const sedeSchema = z.object({
  id: z.number(),

  nome: z.string().min(1).max(150),

  indirizzo: z.string().min(1).max(150),
  civico: z.string().min(1).max(20),

  cap: z.string().regex(/^\d{5}$/, "CAP non valido"),

  citta: z.string().min(1).max(100),

  provincia: z.string().length(2),

  descrizione: z.string().nullish(),

  created_by: z.string().nullish(),
})


export type  SedeFormInput = z.infer<typeof sedeSchema>;