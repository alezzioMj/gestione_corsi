import z from "zod";
import { commessaWithRelationsSchema } from "./commessa.schema";
import { programmaSchema } from "./programma.schema";

const corsoBaseSchema = z.object({
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
});

const orari = (d: Partial<z.infer<typeof corsoBaseSchema>>, ctx: z.RefinementCtx) => {
  if (d.inizio && d.fine && d.fine < d.inizio)
    ctx.addIssue({ code: "custom", path: ["fine"], message: "La data fine deve essere successiva o uguale alla data inizio" });
  if (d.mattina_inizio && d.mattina_fine && d.mattina_fine <= d.mattina_inizio)
    ctx.addIssue({ code: "custom", path: ["mattina_fine"], message: "Fine mattina deve essere dopo l'inizio" });
  if (d.pomeriggio_inizio && d.pomeriggio_fine && d.pomeriggio_fine <= d.pomeriggio_inizio)
    ctx.addIssue({ code: "custom", path: ["pomeriggio_fine"], message: "Fine pomeriggio deve essere dopo l'inizio" });
};

export const corsoSchema = corsoBaseSchema.superRefine(orari);
export const corsoWithRelationsSchema = corsoBaseSchema.extend({ commessa: commessaWithRelationsSchema, programma: programmaSchema }).superRefine(orari);
export const createCorsoSchema = corsoBaseSchema.omit({ id: true, created_at: true }).superRefine(orari);
export const updateCorsoSchema = corsoBaseSchema.partial().superRefine(orari);