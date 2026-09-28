import { z } from "zod";
import { Docente, Programma } from "@progetto/shared/validation/types";

export const formSchema = z.object({
    nome: z.string().min(1, "Il nome del corso è obbligatorio"),
    cliente: z.string().min(1, "Il cliente è obbligatorio"),
    sedi: z.array(z.string()).min(1, "Seleziona almeno una sede"),
    programmi: z.number().min(1, "Seleziona un programma"),
    docenti: z.array(z.string()).min(1, "Seleziona almeno un docente"),
    oreTotali: z.number().min(0, "Le ore totali non possono essere negative"),
    moduliOrdinati: z.array(z.string()).min(1, "L'ordine dei moduli è obbligatorio"),
    dataInizio: z.string().min(1, "Data inizio obbligatoria"),
    dataFine: z.string().min(1, "Data fine obbligatoria"),
    giorni: z.array(z.number()).min(1, "Seleziona almeno un giorno di lezione"),
    mattina_inizio: z.string().min(1, "Orario obbligatorio"),
    mattina_fine: z.string().min(1, "Orario obbligatorio"),
    pomeriggio_inizio: z.string().min(1, "Orario obbligatorio"),
    pomeriggio_fine: z.string().min(1, "Orario obbligatorio"),
    note: z.string().optional(),
});

export type FormType = z.infer<typeof formSchema>;

export interface ModuloRelation {
    modulo_id: number;
    modulo: { titolo: string; n_ore?: number; competenza?: string; multiplo: boolean };
    n_ripetizioni: number;
}

export interface ProgrammaConModuli extends Programma {
    programma_modulo: ModuloRelation[];
    durata_totale: number;
    ore_pratiche: number;
    ore_teoriche: number;
    ore_trasversali: number;
}

export interface DocenteConModuli extends Docente {
    docente_modulo: ModuloRelation[];
}