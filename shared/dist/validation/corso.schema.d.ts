import { z } from "zod";
import type { CommessaWithRelations } from "./commessa.schema";
import type { Docente } from "./docente.schema";
import type { Programma } from "./programma.schema";
import type { Sede } from "./sede.schema";
export declare const corsoSchema: z.ZodObject<{
    id: z.ZodNumber;
    nome: z.ZodString;
    descrizione: z.ZodNullable<z.ZodString>;
    commessa_id: z.ZodNumber;
    programma_id: z.ZodNullable<z.ZodNumber>;
    n_ore: z.ZodNullable<z.ZodNumber>;
    inizio: z.ZodNullable<z.ZodCoercedDate<unknown>>;
    fine: z.ZodNullable<z.ZodCoercedDate<unknown>>;
    mattina_inizio: z.ZodString;
    mattina_fine: z.ZodString;
    pomeriggio_inizio: z.ZodString;
    pomeriggio_fine: z.ZodString;
    created_at: z.ZodNullable<z.ZodCoercedDate<unknown>>;
    created_by: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const createCorsoSchema: z.ZodObject<{
    nome: z.ZodString;
    mattina_inizio: z.ZodString;
    mattina_fine: z.ZodString;
    pomeriggio_inizio: z.ZodString;
    pomeriggio_fine: z.ZodString;
    commessa_id: z.ZodNumber;
    programma_id: z.ZodNumber;
    n_ore: z.ZodNumber;
    inizio: z.ZodCoercedDate<unknown>;
    fine: z.ZodCoercedDate<unknown>;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    docenti: z.ZodArray<z.ZodString>;
    sedi: z.ZodArray<z.ZodNumber>;
    giorniDisponibili: z.ZodArray<z.ZodNumber>;
    ordine: z.ZodArray<z.ZodObject<{
        modulo_id: z.ZodNumber;
        ordine: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateCorsoSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mattina_inizio: z.ZodOptional<z.ZodString>;
    mattina_fine: z.ZodOptional<z.ZodString>;
    pomeriggio_inizio: z.ZodOptional<z.ZodString>;
    pomeriggio_fine: z.ZodOptional<z.ZodString>;
    commessa_id: z.ZodOptional<z.ZodNumber>;
    programma_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    n_ore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    inizio: z.ZodOptional<z.ZodNullable<z.ZodCoercedDate<unknown>>>;
    fine: z.ZodOptional<z.ZodNullable<z.ZodCoercedDate<unknown>>>;
}, z.core.$strip>;
export declare const corsoDocenteSchema: z.ZodObject<{
    corso_id: z.ZodNumber;
    docente_cf: z.ZodString;
    n_ore: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export declare const corsoDocenteInputSchema: z.ZodObject<{
    n_ore: z.ZodNullable<z.ZodNumber>;
    docente_cf: z.ZodString;
}, z.core.$strip>;
export type CorsoSede = {
    corso_id: number;
    sede_id: number;
};
type CorsoDocenteRelations = {
    corso: Corso;
    docente: Docente;
};
type CorsoSedeRelations = {
    corso: Corso;
    sede: Sede;
};
export type CorsoDocenteWithRelations<K extends keyof CorsoDocenteRelations = never> = CorsoDocente & Pick<CorsoDocenteRelations, K>;
export type CorsoSedeWithRelations<K extends keyof CorsoSedeRelations = never> = CorsoSede & Pick<CorsoSedeRelations, K>;
type CorsoRelations = {
    programma: Programma | null;
    commessa: CommessaWithRelations<"cliente">;
    corso_docente: CorsoDocenteWithRelations<"docente">[];
    corso_sede: CorsoSedeWithRelations<"sede">[];
};
export type CorsoWithRelations<K extends keyof CorsoRelations = never> = Corso & Pick<CorsoRelations, K>;
export type Corso = z.infer<typeof corsoSchema>;
export type CreateCorso = z.infer<typeof createCorsoSchema>;
export type UpdateCorso = z.infer<typeof updateCorsoSchema>;
export type CorsoDocente = z.infer<typeof corsoDocenteSchema>;
export type CorsoDocenteInput = z.infer<typeof corsoDocenteInputSchema>;
export {};
