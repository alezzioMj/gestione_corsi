import { z } from "zod";
export declare const sessioneSchema: z.ZodObject<{
    corso_id: z.ZodNumber;
    docente_cf: z.ZodString;
    modulo_id: z.ZodNumber;
    sede_id: z.ZodNumber;
    aula_id: z.ZodNumber;
    data: z.ZodCoercedDate<unknown>;
    ora_inizio: z.ZodString;
    ora_fine: z.ZodString;
    stato: z.ZodDefault<z.ZodEnum<{
        Bozza: "Bozza";
        Confermata: "Confermata";
        Annullata: "Annullata";
    }>>;
    priorita: z.ZodNumber;
    note: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    created_by: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
