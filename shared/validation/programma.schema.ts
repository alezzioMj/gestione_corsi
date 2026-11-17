import { z } from "zod";
import { moduloSchema } from "./modulo.schema";

export const programmaSchema = z.object({
  id: z.number(),

  titolo: z.string().min(1).max(150),

  descrizione: z.string().optional(),

  durata_totale: z.number().int().positive(),

  ore_pratiche: z.number().int().nonnegative(),
  ore_teoriche: z.number().int().nonnegative(),
  ore_trasversali: z.number().int().nonnegative(),

  created_at: z.coerce.date(),
  created_by: z.string().max(100).optional(),
});

export const programmaWithRelationsSchema = programmaSchema.extend({
  moduli: z.array(moduloSchema)
})

export const createProgrammaSchema = programmaSchema.omit(
  {
    id: true, 
    created_at : true
  }
)

export const updateProgrammaSchema = programmaSchema.partial().required({id: true})

export type Programma = z.infer<typeof programmaSchema>
export type ProgrammaWithRelations = z.infer<typeof programmaWithRelationsSchema>
export type CreateProgramma = z.infer<typeof createProgrammaSchema>
export type UpdateProgramma = z.infer<typeof updateProgrammaSchema>

