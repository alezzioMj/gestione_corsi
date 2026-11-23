import { z } from "zod";
import type { Cliente } from "./cliente.schema";

export const agenteSchema = z.object({
    id: z.number(),
    nome: z.string().trim().min(1).max(100),
    cognome: z.string().trim().min(1).max(100),
    email: z.email().max(255).nullish(),
    telefono: z.string().max(30).nullish(),
});

// agente completo: con id = esistente (collega), senza id = nuovo (crea)
export const agenteInputSchema = agenteSchema
    .omit({ id: true })
    .extend({ id: z.number().int().positive().optional() });

export const createAgenteSchema = agenteSchema.omit({ id: true });

export const updateAgenteSchema = createAgenteSchema.partial();

type AgenteRelations = {
    clienti: Cliente[];
};

export type AgenteWithRelations<K extends keyof AgenteRelations = never> =
    Agente & Pick<AgenteRelations, K>;

export type Agente = z.infer<typeof agenteSchema>;
export type AgenteInput = z.infer<typeof agenteInputSchema>;
export type CreateAgente = z.infer<typeof createAgenteSchema>;
export type UpdateAgente = z.infer<typeof updateAgenteSchema>;
