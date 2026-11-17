import { z } from "zod";
export declare const corsoSchema: z.ZodObject<{
    commessa_id: z.ZodNumber;
    programma_id: z.ZodNumber;
    n_ore: z.ZodNumber;
    nome: z.ZodString;
    inizio: z.ZodCoercedDate<unknown>;
    fine: z.ZodCoercedDate<unknown>;
    mattina_inizio: z.ZodString;
    mattina_fine: z.ZodString;
    pomeriggio_inizio: z.ZodString;
    pomeriggio_fine: z.ZodString;
}, z.core.$strip>;
