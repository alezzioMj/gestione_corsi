import { z } from "zod";
export declare const moduloSchema: z.ZodObject<{
    id: z.ZodNumber;
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
    created_at: z.ZodCoercedDate<unknown>;
}, z.core.$strip>;
export declare const createModuloSchema: z.ZodObject<{
    descrizione: z.ZodOptional<z.ZodString>;
    created_by: z.ZodOptional<z.ZodString>;
    n_ore: z.ZodNumber;
    titolo: z.ZodString;
    competenza: z.ZodEnum<{
        Pratica: "Pratica";
        Teorica: "Teorica";
        Trasversale: "Trasversale";
    }>;
    multiplo: z.ZodBoolean;
}, z.core.$strip>;
export declare const updateModuloSchema: z.ZodObject<{
    id: z.ZodNonOptional<z.ZodOptional<z.ZodNumber>>;
    titolo: z.ZodOptional<z.ZodString>;
    n_ore: z.ZodOptional<z.ZodNumber>;
    competenza: z.ZodOptional<z.ZodEnum<{
        Pratica: "Pratica";
        Teorica: "Teorica";
        Trasversale: "Trasversale";
    }>>;
    multiplo: z.ZodOptional<z.ZodBoolean>;
    descrizione: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    created_by: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export type Modulo = z.infer<typeof moduloSchema>;
export type CreateModulo = z.infer<typeof createModuloSchema>;
export type UpdateModulo = z.infer<typeof updateModuloSchema>;
