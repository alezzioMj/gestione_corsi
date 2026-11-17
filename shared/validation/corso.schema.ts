import { z } from "zod";
import { commessaSchema } from "./commessa.schema";
import { programmaSchema } from "./programma.schema";

export const corsoSchema = z.object({
  id: z.number(),
  commessa_id: z.number(),
  programma_id: z.number(),
  n_ore: z.number(),
  nome: z.string().max(150),
  inizio: z.coerce.date(),
  fine: z.coerce.date(),
  mattina_inizio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  mattina_fine: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  pomeriggio_inizio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  pomeriggio_fine: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  created_at: z.coerce.date()
})
  .refine((data) => data.fine >= data.inizio, {
    message: "La data fine deve essere successiva o uguale alla data inizio",
    path: ["fine"],
  })
  .refine((data) => data.mattina_fine > data.mattina_inizio, {
    message: "L'orario di fine mattina deve essere successivo all'inizio",
    path: ["mattina_fine"],
  })
  .refine((data) => data.pomeriggio_fine > data.pomeriggio_inizio, {
    message: "L'orario di fine pomeriggio deve essere successivo all'inizio",
    path: ["pomeriggio_fine"],
  });

export const corsoWithRelationsSchema = corsoSchema.extend({
  commessa: commessaSchema,
  programma: programmaSchema
});

export const createCorsoSchema = corsoSchema.omit(
  {
    id: true,
    created_at: true,
  }
);

export const updateCorsoSchema = corsoSchema.partial().required({ id: true });

export type Corso = z.infer<typeof corsoSchema>;
export type CreateCorso = z.infer<typeof createCorsoSchema>;
export type UpdateCorso = z.infer<typeof updateCorsoSchema>;