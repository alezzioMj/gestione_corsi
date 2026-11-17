import { z } from 'zod';
import { Docente } from './docente.schema';
import { Programma } from './programma.schema';

class AppError extends Error {
  statusCode: number;
  status: "fail" | "error";
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4")
      ? "fail"
      : "error";
    this.isOperational = true;
    this.message = message;
  }
}

export default AppError;

export const formSchema = z.object({
    nome: z.string().min(1, "Il nome del corso è obbligatorio"),
    commessa_id: z.number().int().positive("Seleziona una commessa"),
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
