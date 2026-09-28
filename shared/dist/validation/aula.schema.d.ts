import { z } from "zod";
export declare const aulaSchema: z.ZodObject<{
    nome: z.ZodString;
    sede_id: z.ZodNumber;
    capienza: z.ZodNumber;
    descrizione: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
