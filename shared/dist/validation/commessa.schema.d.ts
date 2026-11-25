import { z } from "zod";
import type { Cliente } from "./cliente.schema";
import type { Corso } from "./corso.schema";
export declare const STATI_COMMESSA: readonly ["APERTA", "IN_CORSO", "CHIUSA", "ANNULLATA"];
export type StatoCommessa = (typeof STATI_COMMESSA)[number];
export declare const commessaSchema: z.ZodObject<{
    id: z.ZodNumber;
    codice_commessa: z.ZodString;
    codice_ft: z.ZodNullable<z.ZodString>;
    codice_rlom: z.ZodNullable<z.ZodString>;
    descrizione: z.ZodNullable<z.ZodString>;
    scadenza: z.ZodNullable<z.ZodCoercedDate<unknown>>;
    cliente_id: z.ZodNullable<z.ZodNumber>;
    stato: z.ZodEnum<{
        APERTA: "APERTA";
        IN_CORSO: "IN_CORSO";
        CHIUSA: "CHIUSA";
        ANNULLATA: "ANNULLATA";
    }>;
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const createCommessaSchema: z.ZodObject<{
    codice_commessa: z.ZodString;
    codice_ft: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    codice_rlom: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    scadenza: z.ZodOptional<z.ZodNullable<z.ZodCoercedDate<unknown>>>;
    cliente_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    stato: z.ZodDefault<z.ZodEnum<{
        APERTA: "APERTA";
        IN_CORSO: "IN_CORSO";
        CHIUSA: "CHIUSA";
        ANNULLATA: "ANNULLATA";
    }>>;
}, z.core.$strip>;
export declare const updateCommessaSchema: z.ZodObject<{
    cliente_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    codice_commessa: z.ZodOptional<z.ZodString>;
    codice_ft: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    codice_rlom: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    scadenza: z.ZodOptional<z.ZodNullable<z.ZodCoercedDate<unknown>>>;
    stato: z.ZodOptional<z.ZodEnum<{
        APERTA: "APERTA";
        IN_CORSO: "IN_CORSO";
        CHIUSA: "CHIUSA";
        ANNULLATA: "ANNULLATA";
    }>>;
}, z.core.$strip>;
type CommessaRelations = {
    corsi: Corso[];
    cliente: Cliente | null;
};
export type CommessaWithRelations<K extends keyof CommessaRelations = never> = Commessa & Pick<CommessaRelations, K>;
export type Commessa = z.infer<typeof commessaSchema>;
export type CreateCommessa = z.infer<typeof createCommessaSchema>;
export type UpdateCommessa = z.infer<typeof updateCommessaSchema>;
export {};
