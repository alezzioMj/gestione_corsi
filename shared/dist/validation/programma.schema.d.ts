import { z } from "zod";
export declare const programmaSchema: z.ZodObject<{
    titolo: z.ZodString;
    descrizione: z.ZodOptional<z.ZodString>;
    durata_totale: z.ZodNumber;
    ore_pratiche: z.ZodNumber;
    ore_teoriche: z.ZodNumber;
    ore_trasversali: z.ZodNumber;
    created_by: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
