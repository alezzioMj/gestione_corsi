import { z } from "zod";
export declare const docenteSchema: z.ZodObject<{
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
export declare const createDocenteSchema: z.ZodObject<{
    nome: z.ZodString;
    provincia: z.ZodString;
    cognome: z.ZodString;
    codice_fiscale: z.ZodString;
    colore: z.ZodEnum<{
        [x: string]: string;
    }>;
    datanascita: z.ZodCoercedDate<unknown>;
    nazione: z.ZodString;
    regione: z.ZodString;
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
}, z.core.$strip>;
export declare const updateDocenteSchema: z.ZodObject<{
    codice_fiscale: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    nome: z.ZodOptional<z.ZodString>;
    colore: z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>;
    cognome: z.ZodOptional<z.ZodString>;
    datanascita: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    nazione: z.ZodOptional<z.ZodString>;
    regione: z.ZodOptional<z.ZodString>;
    provincia: z.ZodOptional<z.ZodString>;
    comune: z.ZodOptional<z.ZodString>;
    sesso: z.ZodOptional<z.ZodEnum<{
        M: "M";
        F: "F";
        Altro: "Altro";
    }>>;
    cellulare: z.ZodOptional<z.ZodString>;
    mail: z.ZodOptional<z.ZodEmail>;
    cv: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    contratto: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<typeof z.coerce.date>;
}, z.core.$strip>;
export type Docente = z.infer<typeof docenteSchema>;
export type CreateDocente = z.infer<typeof createDocenteSchema>;
export type UpdateDocente = z.infer<typeof updateDocenteSchema>;
