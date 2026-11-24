import { z } from "zod";
import type { Sede } from "./sede.schema";

export const aulaSchema = z.object({
    id: z.number().int(),
    nome: z.string().min(1).max(100),
    sede_id: z.number().int(),
    capienza: z.number().int().nonnegative().nullable(),
    descrizione: z.string().nullable(),
});

export const createAulaSchema = aulaSchema
    .omit({ id: true })
    .extend({
        capienza: z.number().int().nonnegative().nullish(),
        descrizione: z.string().nullish(),
    });

export const updateAulaSchema = aulaSchema.omit({ id: true }).partial();

type AulaRelations = {
    sede: Sede;
};

export type AulaWithRelations<K extends keyof AulaRelations = never> =
    Aula & Pick<AulaRelations, K>;

export type Aula = z.infer<typeof aulaSchema>;
export type CreateAula = z.infer<typeof createAulaSchema>;
export type UpdateAula = z.infer<typeof updateAulaSchema>;
