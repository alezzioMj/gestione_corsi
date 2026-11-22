// shared/validation/corso.schema.ts

import { z } from "zod";
import { commessaWithRelationsSchema } from "./commessa.schema";
import { programmaSchema } from "./programma.schema";
import { corsoDocenteSchema, corsoSedeSchema } from "./join.schema";
import { docenteSchema } from "./docente.schema";
import { sedeSchema } from "./sede.schema";

const orario = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Orario non valido (HH:mm)");

const corsoBaseSchema = z.object({
    id: z.number().int(),
    nome: z.string().trim().min(1).max(150),
    descrizione: z.string().nullable(),
    commessa_id: z.number().int(),
    programma_id: z.number().int().nullable(),
    n_ore: z.number().int().positive().nullable(),
    inizio: z.coerce.date().nullable(),
    fine: z.coerce.date().nullable(),
    mattina_inizio: orario,
    mattina_fine: orario,
    pomeriggio_inizio: orario,
    pomeriggio_fine: orario,
    created_at: z.coerce.date().nullable(),
    created_by: z.string().nullable(),
});

type Orari = Partial<z.infer<typeof corsoBaseSchema>>;

const orari = (d: Orari, ctx: z.RefinementCtx) => {
    if (d.inizio && d.fine && d.fine < d.inizio)
        ctx.addIssue({ code: "custom", path: ["fine"], message: "La data fine deve essere successiva o uguale alla data inizio" });
    if (d.mattina_inizio && d.mattina_fine && d.mattina_fine <= d.mattina_inizio)
        ctx.addIssue({ code: "custom", path: ["mattina_fine"], message: "Fine mattina deve essere dopo l'inizio" });
    if (d.pomeriggio_inizio && d.pomeriggio_fine && d.pomeriggio_fine <= d.pomeriggio_inizio)
        ctx.addIssue({ code: "custom", path: ["pomeriggio_fine"], message: "Fine pomeriggio deve essere dopo l'inizio" });
};

export const corsoDocenteWithRelationsSchema = corsoDocenteSchema.extend({
    docente: docenteSchema,
});

export const corsoSedeWithRelationsSchema = corsoSedeSchema.extend({
    sede: sedeSchema,
});

export const corsoSchema = corsoBaseSchema.superRefine(orari);

export const corsoWithRelationsSchema = corsoBaseSchema
    .extend({
        corso_sede: z.array(corsoSedeWithRelationsSchema),
        corso_docente: z.array(corsoDocenteWithRelationsSchema),
        commessa: commessaWithRelationsSchema,
        programma: programmaSchema.nullable(),
    })
    .superRefine(orari);

export const createCorsoSchema = corsoBaseSchema
    .omit({ id: true, created_at: true, created_by: true })
    .extend({
        programma_id: z.number().int(),
        n_ore: z.number().int().positive(),
        inizio: z.coerce.date(),
        fine: z.coerce.date(),
        descrizione: z.string().nullish(),
    })
    .superRefine(orari);

export const updateCorsoSchema = corsoBaseSchema
    .omit({ id: true, created_at: true, created_by: true })
    .partial()
    .superRefine(orari);

export type Corso = z.infer<typeof corsoSchema>;
export type CorsoWithRelations = z.infer<typeof corsoWithRelationsSchema>;
export type CreateCorso = z.infer<typeof createCorsoSchema>;
export type UpdateCorso = z.infer<typeof updateCorsoSchema>;