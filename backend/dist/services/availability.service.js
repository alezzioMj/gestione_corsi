"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAulaDisponibileMemoria = exports.checkDocenteDisponibileMemoria = exports.findAula = exports.findDocente = exports.generateSlots = exports.SchedulingError = void 0;
const time_utils_1 = require("../utils/time.utils");
class SchedulingError extends Error {
    code;
    status;
    details;
    constructor(code, status, message, details) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
        this.name = "SchedulingError";
    }
}
exports.SchedulingError = SchedulingError;
const MINUTI_GIORNO = 24 * 60;
const indisponibilitaCopreSlot = (i, data, startSlot, endSlot) => {
    const giorno = data.getTime();
    const primo = new Date(i.data_inizio).getTime();
    const ultimo = new Date(i.data_fine).getTime();
    if (giorno < primo || giorno > ultimo)
        return false;
    let da = giorno === primo ? (0, time_utils_1.toMinutes)(i.ora_inizio) : 0;
    let a = giorno === ultimo ? (0, time_utils_1.toMinutes)(i.ora_fine) : MINUTI_GIORNO;
    if (da >= a) {
        da = 0;
        a = MINUTI_GIORNO;
    }
    return (0, time_utils_1.hasOverlap)(startSlot, endSlot, da, a);
};
const trovaIndisponibilita = (indisponibilita, match, data, startSlot, endSlot) => indisponibilita.find((i) => match(i) && indisponibilitaCopreSlot(i, data, startSlot, endSlot));
const generateSlots = (inizio, fine, mattino_inizio, mattino_fine, pomeriggio_inizio, pomeriggio_fine, giorniDisponibili) => {
    const slots = [];
    const durataMattina = (0, time_utils_1.calculateHours)(mattino_inizio, mattino_fine);
    const durataPomeriggio = (0, time_utils_1.calculateHours)(pomeriggio_inizio, pomeriggio_fine);
    // Il ciclo genera tutto il calendario potenziale
    while (inizio.getTime() <= fine.getTime()) {
        const day = inizio.getDay();
        const normalizedDay = day === 0 ? 7 : day;
        if (giorniDisponibili.includes(normalizedDay)) {
            // SLOT MATTINO (Senza IF oreRimanenti)
            slots.push({
                data: new Date(inizio),
                ora_inizio: mattino_inizio,
                ora_fine: mattino_fine, // Usa l'orario di fine standard
                durata: durataMattina,
            });
            // SLOT POMERIGGIO (Senza IF oreRimanenti)
            slots.push({
                data: new Date(inizio),
                ora_inizio: pomeriggio_inizio,
                ora_fine: pomeriggio_fine, // Usa l'orario di fine standard
                durata: durataPomeriggio,
            });
        }
        inizio.setDate(inizio.getDate() + 1);
    }
    return slots;
};
exports.generateSlots = generateSlots;
// VALIDAZIONE DOCENTE 
const findDocente = async (listaDocenti, slot, sede_id, cacheSessioni, indisponibilita) => {
    for (const docente of listaDocenti) {
        try {
            // Controlla la disponibilità del docente usando la cache delle sessioni
            (0, exports.checkDocenteDisponibileMemoria)(docente.codice_fiscale, slot.data, slot.ora_inizio, slot.ora_fine, sede_id, cacheSessioni, indisponibilita);
            return docente;
        }
        catch (err) {
            if (err instanceof SchedulingError) {
                continue; // try another one
            }
            throw err;
        }
    }
    return null;
};
exports.findDocente = findDocente;
// VALIDAZIONE AULA VELOCE
const findAula = async (listaAule, slot, cacheSessioni, indisponibilita) => {
    for (const aula of listaAule) {
        try {
            // Controlla la disponibilità dell'aula usando la cache delle sessioni
            (0, exports.checkAulaDisponibileMemoria)(aula.id, aula.sede_id, slot.data, slot.ora_inizio, slot.ora_fine, cacheSessioni, indisponibilita);
            // Se non lancia errori, l'aula è disponibile
            return aula;
        }
        catch (err) {
            if (err instanceof SchedulingError) {
                continue; // try another one
            }
            throw err;
        }
    }
    return null;
};
exports.findAula = findAula;
// VALIDAZIONE DOCENTE 
const checkDocenteDisponibileMemoria = (docente_cf, data, ora_inizio, ora_fine, sede_id, sessioniEsistenti, indisponibilita) => {
    const giorno = data.getTime();
    const startA = (0, time_utils_1.toMinutes)(ora_inizio);
    const endA = (0, time_utils_1.toMinutes)(ora_fine);
    const indDocente = trovaIndisponibilita(indisponibilita, (i) => i.docente_cf === docente_cf, data, startA, endA);
    if (indDocente) {
        throw new SchedulingError("TEACHER_INDISPONIBILE", 409, "Il docente risulta indisponibile in questo slot", { docente_cf, data, ora_inizio, ora_fine, causale: indDocente.causale });
    }
    const indSede = trovaIndisponibilita(indisponibilita, (i) => i.sede_id === sede_id, data, startA, endA);
    if (indSede) {
        throw new SchedulingError("SEDE_INDISPONIBILE", 409, "La sede risulta indisponibile in questo slot", { sede_id, data, ora_inizio, ora_fine, causale: indSede.causale });
    }
    const overlap = sessioniEsistenti.some((s) => {
        if (s.docente_cf !== docente_cf || new Date(s.data).getTime() !== giorno)
            return false;
        return (0, time_utils_1.hasOverlap)(startA, endA, (0, time_utils_1.toMinutes)(s.ora_inizio), (0, time_utils_1.toMinutes)(s.ora_fine));
    });
    if (overlap)
        throw new SchedulingError("TEACHER_UNAVAILABLE", 409, "Il docente è già occupato in questo slot", { docente_cf, data, ora_inizio, ora_fine });
};
exports.checkDocenteDisponibileMemoria = checkDocenteDisponibileMemoria;
// VALIDAZIONE AULA 
const checkAulaDisponibileMemoria = (aula_id, sede_id, data, ora_inizio, ora_fine, sessioniEsistenti, indisponibilita) => {
    const giorno = data.getTime();
    const startA = (0, time_utils_1.toMinutes)(ora_inizio);
    const endA = (0, time_utils_1.toMinutes)(ora_fine);
    const indAula = trovaIndisponibilita(indisponibilita, (i) => i.aula_id === aula_id, data, startA, endA);
    if (indAula) {
        throw new SchedulingError("AULA_INDISPONIBILE", 409, "L'aula risulta indisponibile in questo slot", { aula_id, data, ora_inizio, ora_fine, causale: indAula.causale });
    }
    const indSede = trovaIndisponibilita(indisponibilita, (i) => i.sede_id === sede_id, data, startA, endA);
    if (indSede) {
        throw new SchedulingError("SEDE_INDISPONIBILE", 409, "La sede risulta indisponibile in questo slot", { sede_id, data, ora_inizio, ora_fine, causale: indSede.causale });
    }
    const overlap = sessioniEsistenti.some((s) => {
        if (s.aula_id !== aula_id || new Date(s.data).getTime() !== giorno)
            return false;
        return (0, time_utils_1.hasOverlap)(startA, endA, (0, time_utils_1.toMinutes)(s.ora_inizio), (0, time_utils_1.toMinutes)(s.ora_fine));
    });
    if (overlap)
        throw new SchedulingError("AULA_UNAVAILABLE", 409, "L'aula è già occupata in questo slot", { aula_id, data, ora_inizio, ora_fine });
};
exports.checkAulaDisponibileMemoria = checkAulaDisponibileMemoria;
