import { z } from "zod";
export declare const moduloSchema: z.ZodObject<{
    titolo: z.ZodString;
    n_ore: z.ZodNumber;
    competenza: z.ZodEnum<{
        Pratica: "Pratica";
        Teorica: "Teorica";
        Trasversale: "Trasversale";
    }>;
    multiplo: z.ZodBoolean;
    descrizione: z.ZodOptional<z.ZodString>;
    created_by: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
