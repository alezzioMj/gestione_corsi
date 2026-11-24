import { z } from "zod";
import type { SedeCliente } from "./sedecliente.schema";

export const contattoSchema = z.object({
    id: z.number().int(),
    sede_id: z.number().int(),
    nome: z.string().trim().min(1).max(150),
    email: z.email().max(255).nullish(),
    telefono: z.string().max(30).nullish(),
});

export const createContattoSchema = contattoSchema.omit({ id: true });

export const updateContattoSchema = createContattoSchema.partial();

type ContattoRelations = {
    sede: SedeCliente;
};

export type ContattoWithRelations<K extends keyof ContattoRelations = never> =
    Contatto & Pick<ContattoRelations, K>;

export type Contatto = z.infer<typeof contattoSchema>;
export type CreateContatto = z.infer<typeof createContattoSchema>;
export type UpdateContatto = z.infer<typeof updateContattoSchema>;
