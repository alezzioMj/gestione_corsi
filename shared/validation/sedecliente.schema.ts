import z from "zod"
import { contattoSchema } from "./contatto.schema";

export const sedeClienteSchema = z.object({
    id: z.number(),
    tipo: z.enum([
        "LEGALE",
        "OPERATIVA"
    ]),
    cliente_id: z.number(),
    nome: z.string(),
    indirizzo: z.string(),
    civico: z.string(),
    cap: z.string(),
    citta: z.string(),
    provincia: z.string()
})

export const SedeClienteWithRelationsSchema = sedeClienteSchema.extend({
    contatti: z.array(contattoSchema),
});

export const createSedeClienteSchema = sedeClienteSchema.omit({ id: true })

export const updateSedeClienteSchema = sedeClienteSchema.partial()

export type SedeCliente = z.infer<typeof sedeClienteSchema>
export type SedeClienteWithRelations = z.infer<typeof SedeClienteWithRelationsSchema>;
export type createSedeCliente = z.infer<typeof createSedeClienteSchema>
export type updateSedeCliente = z.infer<typeof updateSedeClienteSchema>