import { z } from "zod";
import { aulaSchema } from "./aula.schema";

export const sedeSchema = z.object({
  id: z.number(),
  nome: z.string().min(1).max(150),

  indirizzo: z.string().min(1).max(150),
  civico: z.string().min(1).max(20),

  cap: z.string().regex(/^\d{5}$/, "CAP non valido"),

  citta: z.string().min(1).max(100),

  provincia: z.string().length(2),

  descrizione: z.string().nullish(),

  created_at: z.coerce.date(),

  created_by: z.string().nullish(),
})

export const SedeWithRelationsSchema = sedeSchema.extend({
  aule: z.array(aulaSchema)
})

export const createSedeSchema = sedeSchema.omit({
  id: true,
  created_at: true,
})

export const updateSedeSchema = sedeSchema.partial().required({id: true});

export type Sede = z.infer<typeof sedeSchema>
export type SedeWithRelations = z.infer<typeof SedeWithRelationsSchema>
export type CreateSede = z.infer<typeof createSedeSchema>
export type UpdateSede = z.infer<typeof updateSedeSchema>
