import z from "zod";
export declare const clienteSchema: z.ZodObject<{
    id: z.ZodNumber;
    ragione_sociale: z.ZodString;
    partita_iva: z.ZodString;
    agente_id: z.ZodNumber;
}, z.core.$strip>;
