import { ApiErrorBody } from "@progetto/shared/validation/types";

export function messaggioErrore(err: ApiErrorBody): string {
    switch (err.code) {
        case "NO_TEACHER_FOR_MODULE":
            return `Nessun docente disponibile per il modulo "${err.details?.moduloTitolo}"`;
        case "INSUFFICIENT_SLOTS":
            return `Slot insufficienti: mancano ${err.details?.oreMancanti} ore per completare la schedulazione`;
        case "AULA_UNAVAILABLE":
            return "Nessuna aula disponibile per uno degli slot richiesti";
        case "MISSING_COURSE_DATES":
            return "Il corso non ha date di inizio/fine impostate";
        default:
            return err.message;
    }
}