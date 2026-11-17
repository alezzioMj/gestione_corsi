import { z } from "zod";
export declare const programmaSchema: z.ZodObject<{
    id: z.ZodNumber;
    titolo: z.ZodString;
    descrizione: z.ZodOptional<z.ZodString>;
    durata_totale: z.ZodNumber;
    ore_pratiche: z.ZodNumber;
    ore_teoriche: z.ZodNumber;
    ore_trasversali: z.ZodNumber;
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const programmaWithRelationsSchema: z.ZodObject<{
    id: z.ZodNumber;
    titolo: z.ZodString;
    descrizione: z.ZodOptional<z.ZodString>;
    durata_totale: z.ZodNumber;
    ore_pratiche: z.ZodNumber;
    ore_teoriche: z.ZodNumber;
    ore_trasversali: z.ZodNumber;
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodOptional<z.ZodString>;
    moduli: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createProgrammaSchema: z.ZodObject<{
    descrizione: z.ZodOptional<z.ZodString>;
    titolo: z.ZodString;
    durata_totale: z.ZodNumber;
    ore_pratiche: z.ZodNumber;
    ore_teoriche: z.ZodNumber;
    ore_trasversali: z.ZodNumber;
    created_by: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateProgrammaSchema: z.ZodObject<{
    id: z.ZodNonOptional<z.ZodOptional<z.ZodNumber>>;
    titolo: z.ZodOptional<z.ZodString>;
    descrizione: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    durata_totale: z.ZodOptional<z.ZodNumber>;
    ore_pratiche: z.ZodOptional<z.ZodNumber>;
    ore_teoriche: z.ZodOptional<z.ZodNumber>;
    ore_trasversali: z.ZodOptional<z.ZodNumber>;
    created_at: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    created_by: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type Programma = z.infer<typeof programmaSchema>;
export type ProgrammaWithRelations = z.infer<typeof programmaWithRelationsSchema>;
export type CreateProgramma = z.infer<typeof createProgrammaSchema>;
export type UpdateProgramma = z.infer<typeof updateProgrammaSchema>;
