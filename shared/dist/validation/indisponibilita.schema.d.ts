import { z } from "zod";
export declare const indisponibilitaSchema: z.ZodObject<{
    docente_cf: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sede_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    aula_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    data_inizio: z.ZodCoercedDate<unknown>;
    data_fine: z.ZodCoercedDate<unknown>;
    ora_inizio: z.ZodString;
    ora_fine: z.ZodString;
    causale: z.ZodString;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
