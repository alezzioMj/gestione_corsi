"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formSchema = void 0;
const zod_1 = require("zod");
class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4")
            ? "fail"
            : "error";
        this.isOperational = true;
        this.message = message;
    }
}
exports.default = AppError;
exports.formSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, "Il nome del corso è obbligatorio"),
    commessa_id: zod_1.z.number().int().positive("Seleziona una commessa"),
    sedi: zod_1.z.array(zod_1.z.number().int().positive()).min(1, "Seleziona almeno una sede"),
    programmi: zod_1.z.number().min(1, "Seleziona un programma"),
    docenti: zod_1.z.array(zod_1.z.string()).min(1, "Seleziona almeno un docente"),
    oreTotali: zod_1.z.number().min(0, "Le ore totali non possono essere negative"),
    moduliOrdinati: zod_1.z.array(zod_1.z.string()).min(1, "L'ordine dei moduli è obbligatorio"),
    dataInizio: zod_1.z.string().min(1, "Data inizio obbligatoria"),
    dataFine: zod_1.z.string().min(1, "Data fine obbligatoria"),
    giorni: zod_1.z.array(zod_1.z.number()).min(1, "Seleziona almeno un giorno di lezione"),
    mattina_inizio: zod_1.z.string().min(1, "Orario obbligatorio"),
    mattina_fine: zod_1.z.string().min(1, "Orario obbligatorio"),
    pomeriggio_inizio: zod_1.z.string().min(1, "Orario obbligatorio"),
    pomeriggio_fine: zod_1.z.string().min(1, "Orario obbligatorio"),
    note: zod_1.z.string().optional(),
});
