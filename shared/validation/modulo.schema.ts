import { z } from "zod";

export const moduloSchema = z.object({
  id: z.number(),
  titolo: z.string().min(1).max(150),

  n_ore: z.number().int().positive(),

  competenza: z.enum([
    "Pratica",
    "Teorica",
    "Trasversale"
  ]),

  multiplo: z.boolean(),

  descrizione: z.string().optional(),

  created_by: z.string().max(100).optional(),
  created_at: z.coerce.date()
});

export const createModuloSchema = moduloSchema.omit(
  {
    id: true,
    created_at: true
  }
)

export const updateModuloSchema = moduloSchema.partial().required({id: true})

export type Modulo = z.infer<typeof moduloSchema>
export type CreateModulo = z.infer<typeof createModuloSchema>
export type UpdateModulo = z.infer<typeof updateModuloSchema>
