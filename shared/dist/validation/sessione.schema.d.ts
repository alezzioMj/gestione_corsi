import { z } from "zod";
import type { Aula } from "./aula.schema";
import type { CorsoWithRelations } from "./corso.schema";
import type { Docente } from "./docente.schema";
import type { Modulo } from "./modulo.schema";
import type { Sede } from "./sede.schema";
export declare const STATI_SESSIONE: readonly ["Bozza", "Confermata", "Annullata", "Completata"];
export type StatoSessione = (typeof STATI_SESSIONE)[number];
export declare const sessioneSchema: z.ZodObject<{
    id: z.ZodNumber;
    corso_id: z.ZodNumber;
    docente_cf: z.ZodNullable<z.ZodString>;
    modulo_id: z.ZodNumber;
    sede_id: z.ZodNumber;
    aula_id: z.ZodNullable<z.ZodNumber>;
    data: z.ZodCoercedDate<unknown>;
    ora_inizio: z.ZodString;
    ora_fine: z.ZodString;
    stato: z.ZodNullable<z.ZodEnum<{
        Bozza: "Bozza";
        Confermata: "Confermata";
        Annullata: "Annullata";
        Completata: "Completata";
    }>>;
    priorita: z.ZodNumber;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const createSessioneSchema: z.ZodObject<{
    sede_id: z.ZodNumber;
    modulo_id: z.ZodNumber;
    corso_id: z.ZodNumber;
    ora_inizio: z.ZodString;
    ora_fine: z.ZodString;
    data: z.ZodCoercedDate<unknown>;
    priorita: z.ZodNumber;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    docente_cf: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    aula_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    stato: z.ZodDefault<z.ZodEnum<{
        Bozza: "Bozza";
        Confermata: "Confermata";
        Annullata: "Annullata";
        Completata: "Completata";
    }>>;
}, z.core.$strip>;
export declare const updateSessioneSchema: z.ZodObject<{
    sede_id: z.ZodOptional<z.ZodNumber>;
    modulo_id: z.ZodOptional<z.ZodNumber>;
    corso_id: z.ZodOptional<z.ZodNumber>;
    ora_inizio: z.ZodOptional<z.ZodString>;
    ora_fine: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    priorita: z.ZodOptional<z.ZodNumber>;
    note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    docente_cf: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    aula_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    stato: z.ZodOptional<z.ZodEnum<{
        Bozza: "Bozza";
        Confermata: "Confermata";
        Annullata: "Annullata";
        Completata: "Completata";
    }>>;
}, z.core.$strip>;
type SessioneRelations = {
    corso: CorsoWithRelations<"programma" | "commessa" | "corso_docente" | "corso_sede">;
    docente: Docente | null;
    modulo: Modulo;
    aula: Aula | null;
    sede: Sede;
};
export type SessioneWithRelations<K extends keyof SessioneRelations = never> = Sessione & Pick<SessioneRelations, K>;
export type Sessione = z.infer<typeof sessioneSchema>;
export type CreateSessione = z.infer<typeof createSessioneSchema>;
export type UpdateSessione = z.infer<typeof updateSessioneSchema>;
export {};
