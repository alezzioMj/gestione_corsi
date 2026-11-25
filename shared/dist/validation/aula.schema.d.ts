import { z } from "zod";
import type { Sede } from "./sede.schema";
export declare const aulaSchema: z.ZodObject<{
    id: z.ZodNumber;
    nome: z.ZodString;
    sede_id: z.ZodNumber;
    capienza: z.ZodNullable<z.ZodNumber>;
    descrizione: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const createAulaSchema: z.ZodObject<{
    nome: z.ZodString;
    sede_id: z.ZodNumber;
    capienza: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateAulaSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    sede_id: z.ZodOptional<z.ZodNumber>;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    capienza: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
type AulaRelations = {
    sede: Sede;
};
export type AulaWithRelations<K extends keyof AulaRelations = never> = Aula & Pick<AulaRelations, K>;
export type Aula = z.infer<typeof aulaSchema>;
export type CreateAula = z.infer<typeof createAulaSchema>;
export type UpdateAula = z.infer<typeof updateAulaSchema>;
export {};
