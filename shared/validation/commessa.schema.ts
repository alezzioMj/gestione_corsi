import { z } from "zod";
import type { Cliente } from "./cliente.schema";
import type { Corso } from "./corso.schema";

export const STATI_COMMESSA = ["APERTA", "IN_CORSO", "CHIUSA", "ANNULLATA"] as const;
export type StatoCommessa = (typeof STATI_COMMESSA)[number];

export const commessaSchema = z.object({
    id: z.number(),
    codice_commessa: z
        .string()
        .trim()
        .min(1, "Il codice commessa è obbligatorio")
        .max(255, "Il codice commessa può avere massimo 255 caratteri"),
    codice_ft: z.string().max(255).nullable(),
    codice_rlom: z.string().max(255).nullable(),
    descrizione: z.string().nullable(),
    scadenza: z.coerce.date().nullable(),
    cliente_id: z.number().nullable(),
    stato: z.enum(STATI_COMMESSA),
    created_at: z.coerce.date(),
    created_by: z.string().max(100).nullable(),
});

// il default di stato sta solo in create: nel partial() di update si riapplicherebbe (Zod 4)
export const createCommessaSchema = commessaSchema
    .omit({ id: true, created_at: true, created_by: true })
    .extend({
        codice_ft: z.string().max(255).nullish(),
        codice_rlom: z.string().max(255).nullish(),
        descrizione: z.string().nullish(),
        scadenza: z.coerce.date().nullish(),
        cliente_id: z.number().nullish(),
        stato: z.enum(STATI_COMMESSA).default("APERTA"),
    });

export const updateCommessaSchema = commessaSchema
    .omit({ id: true, created_at: true, created_by: true })
    .partial();

type CommessaRelations = {
    corsi: Corso[];
    cliente: Cliente | null; // cliente_id Int? nel modello Prisma
};

export type CommessaWithRelations<K extends keyof CommessaRelations = never> =
    Commessa & Pick<CommessaRelations, K>;

export type Commessa = z.infer<typeof commessaSchema>;
export type CreateCommessa = z.infer<typeof createCommessaSchema>;
export type UpdateCommessa = z.infer<typeof updateCommessaSchema>;
