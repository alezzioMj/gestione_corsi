// shared/validation/corso.schema.ts

import { z } from "zod";
import { orarioSchema } from "./common.schema";
import type { CommessaWithRelations } from "./commessa.schema";
import type { Docente } from "./docente.schema";
import type { Programma } from "./programma.schema";
import type { Sede } from "./sede.schema";

const corsoBaseSchema = z.object({
    id: z.number().int(),
    nome: z.string().trim().min(1).max(150),
    descrizione: z.string().nullable(),
    commessa_id: z.number().int(),
    programma_id: z.number().int().nullable(),
    n_ore: z.number().int().positive().nullable(),
    inizio: z.coerce.date().nullable(),
    fine: z.coerce.date().nullable(),
    mattina_inizio: orarioSchema,
    mattina_fine: orarioSchema,
    pomeriggio_inizio: orarioSchema,
    pomeriggio_fine: orarioSchema,
    created_at: z.coerce.date().nullable(),
    created_by: z.string().max(100).nullable(),
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

export const corsoSchema = corsoBaseSchema.superRefine(orari);

export const createCorsoSchema = corsoBaseSchema
    .omit({ id: true, created_at: true, created_by: true })
    .extend({
        programma_id: z.number().int(),
        n_ore: z.number().int().positive(),
        inizio: z.coerce.date(),
        fine: z.coerce.date(),
        descrizione: z.string().nullish(),

        docenti: z.array(z.string().length(16)),
        sedi: z.array(z.number().int()),

        giorniDisponibili: z.array(z.number().int().min(0).max(6)),

        ordine: z.array(z.object({
            modulo_id: z.number().int(),
            ordine: z.number().int().positive(),
        })),
    })
    .superRefine(orari);
    
export const updateCorsoSchema = corsoBaseSchema
    .omit({ id: true, created_at: true, created_by: true })
    .partial()
    .superRefine(orari);

// ---- tabelle di collegamento gestite dal corso ----
export const corsoDocenteSchema = z.object({
    corso_id: z.number().int().positive(),
    docente_cf: z.string().length(16),
    n_ore: z.number().int().positive().nullable(),
});

export const corsoDocenteInputSchema = corsoDocenteSchema.omit({ corso_id: true });

export type CorsoSede = { corso_id: number; sede_id: number };

type CorsoDocenteRelations = { corso: Corso; docente: Docente };
type CorsoSedeRelations = { corso: Corso; sede: Sede };

export type CorsoDocenteWithRelations<K extends keyof CorsoDocenteRelations = never> =
    CorsoDocente & Pick<CorsoDocenteRelations, K>;

export type CorsoSedeWithRelations<K extends keyof CorsoSedeRelations = never> =
    CorsoSede & Pick<CorsoSedeRelations, K>;

// Allineato a INCLUDE_MAP di corsoController: commessa arriva sempre con il cliente
type CorsoRelations = {
    programma: Programma | null;
    commessa: CommessaWithRelations<"cliente">;
    corso_docente: CorsoDocenteWithRelations<"docente">[];
    corso_sede: CorsoSedeWithRelations<"sede">[];
};

export type CorsoWithRelations<K extends keyof CorsoRelations = never> =
    Corso & Pick<CorsoRelations, K>;

export type Corso = z.infer<typeof corsoSchema>;
export type CreateCorso = z.infer<typeof createCorsoSchema>;
export type UpdateCorso = z.infer<typeof updateCorsoSchema>;
export type CorsoDocente = z.infer<typeof corsoDocenteSchema>;
export type CorsoDocenteInput = z.infer<typeof corsoDocenteInputSchema>;
