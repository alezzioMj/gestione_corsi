import { z } from "zod";
export declare const sedeSchema: z.ZodObject<{
    id: z.ZodNumber;
    nome: z.ZodString;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const SedeWithRelationsSchema: z.ZodObject<{
    id: z.ZodNumber;
    nome: z.ZodString;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    aule: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        nome: z.ZodString;
        sede_id: z.ZodNumber;
        capienza: z.ZodNumber;
        descrizione: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createSedeSchema: z.ZodObject<{
    nome: z.ZodString;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
    created_by: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateSedeSchema: z.ZodObject<{
    id: z.ZodNonOptional<z.ZodOptional<z.ZodNumber>>;
    nome: z.ZodOptional<z.ZodString>;
    indirizzo: z.ZodOptional<z.ZodString>;
    civico: z.ZodOptional<z.ZodString>;
    cap: z.ZodOptional<z.ZodString>;
    citta: z.ZodOptional<z.ZodString>;
    provincia: z.ZodOptional<z.ZodString>;
    descrizione: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    created_at: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    created_by: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
export type Sede = z.infer<typeof sedeSchema>;
export type SedeWithRelations = z.infer<typeof SedeWithRelationsSchema>;
export type CreateSede = z.infer<typeof createSedeSchema>;
export type UpdateSede = z.infer<typeof updateSedeSchema>;
