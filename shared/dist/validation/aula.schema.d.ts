import { z } from "zod";
export declare const aulaSchema: z.ZodObject<{
    id: z.ZodNumber;
    nome: z.ZodString;
    sede_id: z.ZodNumber;
    capienza: z.ZodNumber;
    descrizione: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createAulaSchema: z.ZodObject<{
    nome: z.ZodString;
    sede_id: z.ZodNumber;
    capienza: z.ZodNumber;
    descrizione: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateAulaSchema: z.ZodObject<{
    id: z.ZodNonOptional<z.ZodOptional<z.ZodNumber>>;
    nome: z.ZodOptional<z.ZodString>;
    sede_id: z.ZodOptional<z.ZodNumber>;
    capienza: z.ZodOptional<z.ZodNumber>;
    descrizione: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type Aula = z.infer<typeof aulaSchema>;
export type CreateAula = z.infer<typeof createAulaSchema>;
export type UpdateAula = z.infer<typeof updateAulaSchema>;
