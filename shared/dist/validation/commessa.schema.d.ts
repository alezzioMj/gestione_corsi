import { z } from "zod";
export declare const commessaSchema: z.ZodObject<{
    id: z.ZodNumber;
    codice_commessa: z.ZodString;
    codice_ft: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    codice_rlom: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    scadenza: z.ZodOptional<z.ZodNullable<z.ZodCoercedDate<unknown>>>;
    cliente_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    stato: z.ZodOptional<z.ZodEnum<{
        APERTA: "APERTA";
        IN_CORSO: "IN_CORSO";
        CHIUSA: "CHIUSA";
        ANNULLATA: "ANNULLATA";
    }>>;
}, z.core.$strip>;
export declare const createCommessaSchema: z.ZodObject<{
    codice_commessa: z.ZodString;
    codice_ft: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    codice_rlom: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    scadenza: z.ZodOptional<z.ZodNullable<z.ZodCoercedDate<unknown>>>;
    cliente_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    stato: z.ZodOptional<z.ZodEnum<{
        APERTA: "APERTA";
        IN_CORSO: "IN_CORSO";
        CHIUSA: "CHIUSA";
        ANNULLATA: "ANNULLATA";
    }>>;
}, z.core.$strip>;
export declare const updateCommessaSchema: z.ZodObject<{
    codice_commessa: z.ZodOptional<z.ZodString>;
    codice_ft: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    codice_rlom: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    descrizione: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    scadenza: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodCoercedDate<unknown>>>>;
    cliente_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    stato: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        APERTA: "APERTA";
        IN_CORSO: "IN_CORSO";
        CHIUSA: "CHIUSA";
        ANNULLATA: "ANNULLATA";
    }>>>;
}, z.core.$strip>;
export type Commessa = z.infer<typeof commessaSchema>;
export type CreateCommessa = z.infer<typeof createCommessaSchema>;
export type UpdateCommessa = z.infer<typeof updateCommessaSchema>;
