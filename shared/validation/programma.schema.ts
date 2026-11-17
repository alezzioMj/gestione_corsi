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

// Schema della tabella intermedia
export const programmaModuloSchema = z.object({
  id: z.number(),
  programma_id: z.number(),
  modulo_id: z.number(),
  ordine: z.number().int(),
  obbligatorio: z.boolean().nullable(),
  n_ripetizioni: z.number().int(),
});

// Schema della relazione completa
export const programmaModuloWithRelationsSchema = programmaModuloSchema.extend({
  modulo: moduloSchema.nullable(),
});

export const programmaWithRelationsSchema = programmaSchema.extend({
  moduli: z.array(programmaModuloWithRelationsSchema),
});

export const createProgrammaSchema = programmaSchema.omit({
  id: true,
  created_at: true,
});

export const updateProgrammaSchema = programmaSchema.partial()

export type Programma = z.infer<typeof programmaSchema>;
export type ProgrammaModulo = z.infer<typeof programmaModuloSchema>;
export type ProgrammaModuloWithRelations = z.infer<typeof programmaModuloWithRelationsSchema>;
export type ProgrammaWithRelations = z.infer<typeof programmaWithRelationsSchema>;
export type CreateProgramma = z.infer<typeof createProgrammaSchema>;
export type UpdateProgramma = z.infer<typeof updateProgrammaSchema>;