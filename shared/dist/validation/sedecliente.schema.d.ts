import z from "zod";
export declare const sedeClienteSchema: z.ZodObject<{
    id: z.ZodNumber;
    tipo: z.ZodEnum<{
        LEGALE: "LEGALE";
        OPERATIVA: "OPERATIVA";
    }>;
    cliente_id: z.ZodNumber;
    nome: z.ZodString;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
}, z.core.$strip>;
