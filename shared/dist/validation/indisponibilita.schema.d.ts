import { z } from "zod";
export declare const indisponibilitaSchema: z.ZodObject<{
    id: z.ZodNumber;
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
export declare const createIndisponibilitaSchema: z.ZodObject<{
    sede_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    docente_cf: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    aula_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    data_inizio: z.ZodCoercedDate<unknown>;
    data_fine: z.ZodCoercedDate<unknown>;
    ora_inizio: z.ZodString;
    ora_fine: z.ZodString;
    causale: z.ZodString;
}, z.core.$strip>;
export declare const updateIndisponibilitaSchema: z.ZodObject<{
    id: z.ZodNonOptional<z.ZodOptional<z.ZodNumber>>;
    docente_cf: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    sede_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    aula_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    data_inizio: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    data_fine: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    ora_inizio: z.ZodOptional<z.ZodString>;
    ora_fine: z.ZodOptional<z.ZodString>;
    causale: z.ZodOptional<z.ZodString>;
    descrizione: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
export type Indisponibilita = z.infer<typeof indisponibilitaSchema>;
export type CreateIndisponibilita = z.infer<typeof createIndisponibilitaSchema>;
export type UpdateIndisponibilita = z.infer<typeof updateIndisponibilitaSchema>;
