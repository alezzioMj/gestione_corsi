import { z } from "zod";
import { id } from "zod/locales";

export const aulaSchema = z.object({
    id: z.number(),
    nome : z.string().max(100),
    sede_id : z.number(),
    capienza : z.number(),
    descrizione : z.string().optional()
});

export const createAulaSchema = aulaSchema.omit({id : true})

export const updateAulaSchema = aulaSchema.partial().required({id : true});

export type Aula = z.infer<typeof aulaSchema>;
export type CreateAula = z.infer<typeof createAulaSchema>;
export type UpdateAula = z.infer<typeof updateAulaSchema>;