import { z } from "zod";

export const programmaSchema = z.object({
  titolo: z.string().min(1).max(150),

  descrizione: z.string().optional(),

  durata_totale: z.number().int().positive(),

  ore_pratiche: z.number().int().nonnegative(),
  ore_teoriche: z.number().int().nonnegative(),
  ore_trasversali: z.number().int().nonnegative(),

  created_by: z.string().max(100).optional(),
});
