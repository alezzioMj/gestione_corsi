import { keyof, z } from "zod";
import { id } from "zod/locales";
import { Sede, sedeSchema } from "./sede.schema";
import { pick } from "zod/mini";

export const aulaSchema = z.object({
    id: z.number(),
    nome : z.string().max(100),
    sede_id : z.number(),
    capienza : z.number(),
    descrizione : z.string().optional()
});

export const createAulaSchema = aulaSchema.omit({id : true})

export const updateAulaSchema = aulaSchema.partial();

type AulaRelations = {
  sede: Sede
}

export type AulaWithRelations<K extends keyof AulaRelations = never> = 
Aula & Pick<AulaRelations, K>;


export type Aula = z.infer<typeof aulaSchema>;
export type CreateAula = z.infer<typeof createAulaSchema>;
export type UpdateAula = z.infer<typeof updateAulaSchema>;