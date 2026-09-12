import { z } from "zod";
export const moduloSchema = z.object({
  titolo: z.string().min(1),
  n_ore: z.coerce.number().optional(), // coerce converte "4" → 4 automaticamente
  competenza: z.string(),
  multiplo: z.coerce.boolean().optional(), // ATTENZIONE: vedi nota sotto
  created_by: z.string().optional(),
});