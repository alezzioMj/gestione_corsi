import { corsoSchema } from '../validation/corso.schema';
import { aulaSchema } from '../validation/aula.schema';
import { docenteSchema } from '../validation/docente.schema';
import { sedeSchema } from '../validation/sede.schema';
import { programmaSchema } from './programma.schema';
import { z } from 'zod';
export type CorsoFormInput = z.infer<typeof corsoSchema>;
export type AulaFormInput = z.infer<typeof aulaSchema>;
export type DocenteFormInput = z.infer<typeof docenteSchema>;
export type SedeFormInput = z.infer<typeof sedeSchema>;
export type ProgrammaFormInput = z.infer<typeof programmaSchema>;
export declare const corsoDbSchema: z.ZodObject<{
    cliente: z.ZodString;
    programma_id: z.ZodNumber;
    n_ore: z.ZodNumber;
    nome: z.ZodString;
    inizio: z.ZodCoercedDate<unknown>;
    fine: z.ZodCoercedDate<unknown>;
    mattina_inizio: z.ZodString;
    mattina_fine: z.ZodString;
    pomeriggio_inizio: z.ZodString;
    pomeriggio_fine: z.ZodString;
    id: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export declare const programmaDbSchema: z.ZodObject<{
    titolo: z.ZodString;
    descrizione: z.ZodOptional<z.ZodString>;
    durata_totale: z.ZodNumber;
    ore_pratiche: z.ZodNumber;
    ore_teoriche: z.ZodNumber;
    ore_trasversali: z.ZodNumber;
    created_by: z.ZodOptional<z.ZodString>;
    id: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export declare const aulaDbSchema: z.ZodObject<{
    nome: z.ZodString;
    sede_id: z.ZodNumber;
    capienza: z.ZodNumber;
    descrizione: z.ZodOptional<z.ZodString>;
    id: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export declare const docenteDbSchema: z.ZodObject<{
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
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export declare const sedeDbSchema: z.ZodObject<{
    nome: z.ZodString;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_by: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    id: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export declare const moduloDbSchema: z.ZodObject<{
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
    id: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export declare const sessioneDbSchema: z.ZodObject<{
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
    id: z.ZodNumber;
}, z.core.$strip>;
export declare const apiErrorSchema: z.ZodObject<{
    error: z.ZodOptional<z.ZodString>;
    issues: z.ZodOptional<z.ZodArray<z.ZodObject<{
        message: z.ZodString;
        path: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ApiErrorData = z.infer<typeof apiErrorSchema>;
export type Corso = z.infer<typeof corsoDbSchema>;
export type Programma = z.infer<typeof programmaDbSchema>;
export type Aula = z.infer<typeof aulaDbSchema>;
export type Docente = z.infer<typeof docenteDbSchema>;
export type Sede = z.infer<typeof sedeDbSchema>;
export type Modulo = z.infer<typeof moduloDbSchema>;
export declare const SessioneWithRelations: z.ZodObject<{
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
    id: z.ZodNumber;
    corso: z.ZodObject<{
        cliente: z.ZodString;
        programma_id: z.ZodNumber;
        n_ore: z.ZodNumber;
        nome: z.ZodString;
        inizio: z.ZodCoercedDate<unknown>;
        fine: z.ZodCoercedDate<unknown>;
        mattina_inizio: z.ZodString;
        mattina_fine: z.ZodString;
        pomeriggio_inizio: z.ZodString;
        pomeriggio_fine: z.ZodString;
        id: z.ZodNumber;
        createdAt: z.ZodOptional<z.ZodDate>;
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
        createdAt: z.ZodOptional<z.ZodDate>;
    }, z.core.$strip>;
    modulo: z.ZodObject<{
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
    }, z.core.$strip>;
    aula: z.ZodObject<{
        nome: z.ZodString;
        sede_id: z.ZodNumber;
        capienza: z.ZodNumber;
        descrizione: z.ZodOptional<z.ZodString>;
        id: z.ZodNumber;
        createdAt: z.ZodOptional<z.ZodDate>;
    }, z.core.$strip>;
    sede: z.ZodObject<{
        nome: z.ZodString;
        indirizzo: z.ZodString;
        civico: z.ZodString;
        cap: z.ZodString;
        citta: z.ZodString;
        provincia: z.ZodString;
        descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        created_by: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        id: z.ZodNumber;
        createdAt: z.ZodOptional<z.ZodDate>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type SessioneWithRelations = z.infer<typeof SessioneWithRelations>;
export interface ApiErrorBody {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
