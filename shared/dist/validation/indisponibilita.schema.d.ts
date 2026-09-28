import { z } from "zod";
export declare const indisponibilitaSchema: z.ZodObject<{
    tipologia: z.ZodEnum<{
        DOCENTE: "DOCENTE";
        SEDE: "SEDE";
        AULA: "AULA";
    }>;
    docente_cf: z.ZodOptional<z.ZodString>;
    sede_id: z.ZodOptional<z.ZodNumber>;
    aula_id: z.ZodOptional<z.ZodNumber>;
    data_inizio: z.ZodCoercedDate<unknown>;
    data_fine: z.ZodCoercedDate<unknown>;
    ora_inizio: z.ZodString;
    ora_fine: z.ZodString;
    causale: z.ZodString;
    descrizione: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
