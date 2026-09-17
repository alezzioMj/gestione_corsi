import { z } from "zod";

export const moduloSchema = z.object({
  titolo: z.string().min(1).max(150),

  n_ore: z.number().int().positive(),

  competenza: z.enum([
    "Pratica",
    "Teorica",
    "Trasversale"
  ]),

  multiplo : z.boolean,

  descrizione: z.string().optional(),

  created_by: z.string().max(100).optional(),
});