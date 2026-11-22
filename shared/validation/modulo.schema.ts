import { z } from "zod";

export const moduloSchema = z.object({
  id: z.number(),
  titolo: z.string().min(1).max(150),

  n_ore: z.coerce.number().int().positive(),

  competenza: z.enum([
    "Pratica",
    "Teorica",
    "Trasversale"
  ]),

  multiplo: z.enum(["true", "false"]).transform((v) => v === "true"),

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

export const updateModuloSchema = moduloSchema.partial()

export type Modulo = z.infer<typeof moduloSchema>
export type CreateModulo = z.infer<typeof createModuloSchema>
export type UpdateModulo = z.infer<typeof updateModuloSchema>
