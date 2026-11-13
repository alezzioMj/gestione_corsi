import z from "zod";

export const clienteSchema = z.object({
    id: z.number(),
    ragione_sociale : z.string(),
    partita_iva: z.string(),
    agente_id: z.number(),
})
