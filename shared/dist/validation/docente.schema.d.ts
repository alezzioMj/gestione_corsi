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
}, z.core.$strip>;
