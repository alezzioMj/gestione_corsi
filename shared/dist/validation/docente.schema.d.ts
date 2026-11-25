import { z } from "zod";
import type { CorsoDocenteWithRelations } from "./corso.schema";
import type { Modulo } from "./modulo.schema";
export declare const docenteSchema: z.ZodObject<{
    codice_fiscale: z.ZodString;
    nome: z.ZodString;
    colore: z.ZodEnum<{
        "#1976d2": "#1976d2";
        "#388e3c": "#388e3c";
        "#f57c00": "#f57c00";
        "#7b1fa2": "#7b1fa2";
        "#c2185b": "#c2185b";
        "#0097a7": "#0097a7";
        "#455a64": "#455a64";
        "#e64a19": "#e64a19";
        "#00796b": "#00796b";
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
    cv: z.ZodString;
    contratto: z.ZodString;
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const createDocenteSchema: z.ZodObject<{
    nome: z.ZodString;
    provincia: z.ZodString;
    cognome: z.ZodString;
    codice_fiscale: z.ZodString;
    colore: z.ZodEnum<{
        "#1976d2": "#1976d2";
        "#388e3c": "#388e3c";
        "#f57c00": "#f57c00";
        "#7b1fa2": "#7b1fa2";
        "#c2185b": "#c2185b";
        "#0097a7": "#0097a7";
        "#455a64": "#455a64";
        "#e64a19": "#e64a19";
        "#00796b": "#00796b";
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
    cv: z.ZodString;
    contratto: z.ZodString;
}, z.core.$strip>;
export declare const updateDocenteSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    provincia: z.ZodOptional<z.ZodString>;
    cognome: z.ZodOptional<z.ZodString>;
    colore: z.ZodOptional<z.ZodEnum<{
        "#1976d2": "#1976d2";
        "#388e3c": "#388e3c";
        "#f57c00": "#f57c00";
        "#7b1fa2": "#7b1fa2";
        "#c2185b": "#c2185b";
        "#0097a7": "#0097a7";
        "#455a64": "#455a64";
        "#e64a19": "#e64a19";
        "#00796b": "#00796b";
    }>>;
    datanascita: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    nazione: z.ZodOptional<z.ZodString>;
    regione: z.ZodOptional<z.ZodString>;
    comune: z.ZodOptional<z.ZodString>;
    sesso: z.ZodOptional<z.ZodEnum<{
        M: "M";
        F: "F";
        Altro: "Altro";
    }>>;
    cellulare: z.ZodOptional<z.ZodString>;
    mail: z.ZodOptional<z.ZodEmail>;
    cv: z.ZodOptional<z.ZodString>;
    contratto: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DocenteModulo = {
    docente_cf: string;
    modulo_id: number;
};
type DocenteModuloRelations = {
    docente: Docente;
    modulo: Modulo;
};
export type DocenteModuloWithRelations<K extends keyof DocenteModuloRelations = never> = DocenteModulo & Pick<DocenteModuloRelations, K>;
type DocenteRelations = {
    docente_modulo: DocenteModuloWithRelations<"modulo">[];
    corso_docente: CorsoDocenteWithRelations<"corso">[];
};
export type DocenteWithRelations<K extends keyof DocenteRelations = never> = Docente & Pick<DocenteRelations, K>;
export type Docente = z.infer<typeof docenteSchema>;
export type CreateDocente = z.infer<typeof createDocenteSchema>;
export type UpdateDocente = z.infer<typeof updateDocenteSchema>;
export {};
