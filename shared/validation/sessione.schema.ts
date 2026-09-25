import { z } from "zod";

export const sessioneSchema = z.object({
  corso_id: z.number().int().positive(),
  docente_cf: z.string().length(16),

  modulo_id: z.number().int().positive(),
  sede_id: z.number().int().positive(),
  aula_id: z.number().int().positive(),

  data: z.coerce.date(),

  ora_inizio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  ora_fine: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),

  stato: z.enum(["Bozza", "Confermata", "Annullata"]).default("Bozza"),

  priorita: z.number().int().min(0),

  note: z.string().optional().nullable(),

  created_by: z.string().max(100).optional().nullable(),
})
.refine((data) => data.ora_fine > data.ora_inizio, {
  message: "ora_fine deve essere successiva a ora_inizio",
  path: ["ora_fine"],
});