import z from "zod"

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