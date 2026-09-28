import { z } from "zod";
export declare const sedeSchema: z.ZodObject<{
    nome: z.ZodString;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_by: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type SedeFormInput = z.infer<typeof sedeSchema>;
