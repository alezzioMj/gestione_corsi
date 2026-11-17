import { z } from "zod";
export declare const sessioneSchema: z.ZodObject<{
    id: z.ZodNumber;
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
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const sessioneWithRelationsSchema: z.ZodObject<{
    id: z.ZodNumber;
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
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    corso: z.ZodObject<{
        id: z.ZodNumber;
        commessa_id: z.ZodNumber;
        programma_id: z.ZodNumber;
        n_ore: z.ZodNumber;
        nome: z.ZodString;
        inizio: z.ZodCoercedDate<unknown>;
        fine: z.ZodCoercedDate<unknown>;
        mattina_inizio: z.ZodString;
        mattina_fine: z.ZodString;
        pomeriggio_inizio: z.ZodString;
        pomeriggio_fine: z.ZodString;
        created_at: z.ZodCoercedDate<unknown>;
        commessa: z.ZodObject<{
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
        programma: z.ZodObject<{
            id: z.ZodNumber;
            titolo: z.ZodString;
            descrizione: z.ZodOptional<z.ZodString>;
            durata_totale: z.ZodNumber;
            ore_pratiche: z.ZodNumber;
            ore_teoriche: z.ZodNumber;
            ore_trasversali: z.ZodNumber;
            created_at: z.ZodCoercedDate<unknown>;
            created_by: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    docente: z.ZodObject<{
        codice_fiscale: z.ZodString;
        nome: z.ZodString;
        colore: z.ZodEnum<{
            [x: string]: string;
        }>;
        cognome: z.ZodString;
        datanascita: z.ZodCoercedDate<unknown>;
        nazione: z.ZodString;
        regione: z.ZodString;
        provincia: z.ZodString;
        comune: z.ZodString;
        sesso: z.ZodEnum<{
            M: "M";
            F: "F";
            Altro: "Altro";
        }>;
        cellulare: z.ZodString;
        mail: z.ZodEmail;
        cv: z.ZodOptional<z.ZodString>;
        contratto: z.ZodString;
        created_at: typeof z.coerce.date;
    }, z.core.$strip>;
    modulo: z.ZodObject<{
        id: z.ZodNumber;
        titolo: z.ZodString;
        n_ore: z.ZodNumber;
        competenza: z.ZodEnum<{
            Pratica: "Pratica";
            Teorica: "Teorica";
            Trasversale: "Trasversale";
        }>;
        multiplo: z.ZodBoolean;
        descrizione: z.ZodOptional<z.ZodString>;
        created_by: z.ZodOptional<z.ZodString>;
        created_at: z.ZodCoercedDate<unknown>;
    }, z.core.$strip>;
    aula: z.ZodObject<{
        id: z.ZodNumber;
        nome: z.ZodString;
        sede_id: z.ZodNumber;
        capienza: z.ZodNumber;
        descrizione: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    sede: z.ZodObject<{
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
}, z.core.$strip>;
export declare const createSessioneSchema: z.ZodObject<{
    stato: z.ZodDefault<z.ZodEnum<{
        Bozza: "Bozza";
        Confermata: "Confermata";
        Annullata: "Annullata";
    }>>;
    created_by: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    corso_id: z.ZodNumber;
    docente_cf: z.ZodString;
    modulo_id: z.ZodNumber;
    sede_id: z.ZodNumber;
    aula_id: z.ZodNumber;
    data: z.ZodCoercedDate<unknown>;
    ora_inizio: z.ZodString;
    ora_fine: z.ZodString;
    priorita: z.ZodNumber;
    note: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateSessioneSchema: z.ZodObject<{
    id: z.ZodNonOptional<z.ZodOptional<z.ZodNumber>>;
    corso_id: z.ZodOptional<z.ZodNumber>;
    docente_cf: z.ZodOptional<z.ZodString>;
    modulo_id: z.ZodOptional<z.ZodNumber>;
    sede_id: z.ZodOptional<z.ZodNumber>;
    aula_id: z.ZodOptional<z.ZodNumber>;
    data: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    ora_inizio: z.ZodOptional<z.ZodString>;
    ora_fine: z.ZodOptional<z.ZodString>;
    stato: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        Bozza: "Bozza";
        Confermata: "Confermata";
        Annullata: "Annullata";
    }>>>;
    priorita: z.ZodOptional<z.ZodNumber>;
    note: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    created_at: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    created_by: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, z.core.$strip>;
export type Sessione = z.infer<typeof sessioneSchema>;
export type SessioneWithRelations = z.infer<typeof sessioneWithRelationsSchema>;
export type CreateSessione = z.infer<typeof createSessioneSchema>;
export type UpdateSessione = z.infer<typeof updateSessioneSchema>;
