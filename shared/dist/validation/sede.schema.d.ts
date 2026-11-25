import { z } from "zod";
import type { Aula } from "./aula.schema";
import type { CorsoSedeWithRelations } from "./corso.schema";
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
    created_by: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const createSedeSchema: z.ZodObject<{
    nome: z.ZodString;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateSedeSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    indirizzo: z.ZodOptional<z.ZodString>;
    civico: z.ZodOptional<z.ZodString>;
    cap: z.ZodOptional<z.ZodString>;
    citta: z.ZodOptional<z.ZodString>;
    provincia: z.ZodOptional<z.ZodString>;
    descrizione: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
type SedeRelations = {
    aula: Aula[];
    corso_sede: CorsoSedeWithRelations<"corso">[];
};
export type SedeWithRelations<K extends keyof SedeRelations = never> = Sede & Pick<SedeRelations, K>;
export type Sede = z.infer<typeof sedeSchema>;
export type CreateSede = z.infer<typeof createSedeSchema>;
export type UpdateSede = z.infer<typeof updateSedeSchema>;
export {};
