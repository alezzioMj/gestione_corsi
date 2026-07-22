"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAulaDisponibileMemoria = exports.checkDocenteDisponibileMemoria = exports.findAula = exports.findDocente = exports.generateSlots = void 0;
const time_utils_1 = require("../utils/time.utils");
const generateSlots = (inizio, fine, mattino_inizio, mattino_fine, pomeriggio_inizio, pomeriggio_fine, giorniDisponibili, ordine) => {
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
const findDocente = async (listaDocenti, slot, cacheSessioni // Le sessioni caricate all'inizio + quelle create al volo
) => {
    for (const docente of listaDocenti) {
        try {
            // Controlla la disponibilità del docente usando la cache delle sessioni
            (0, exports.checkDocenteDisponibileMemoria)(docente.codice_fiscale, slot.data, slot.ora_inizio, slot.ora_fine, cacheSessioni);
            // Se non lancia errori, il docente è disponibile
            return docente;
        }
        catch (err) {
            // Se è occupato, il loop continua al prossimo docente
            // console.log(`Docente ${docente.cognome} occupato: ${err.message}`);
        }
    }
    return null;
};
exports.findDocente = findDocente;
// VALIDAZIONE AULA VELOCE
const findAula = async (listaAule, slot, cacheSessioni) => {
    for (const aula of listaAule) {
        try {
            // Controlla la disponibilità dell'aula usando la cache delle sessioni
            (0, exports.checkAulaDisponibileMemoria)(aula.id, slot.data, slot.ora_inizio, slot.ora_fine, cacheSessioni);
            // Se non lancia errori, l'aula è disponibile
            return aula;
        }
        catch (err) {
            continue;
        }
    }
    return null;
};
exports.findAula = findAula;
// VALIDAZIONE DOCENTE 
const checkDocenteDisponibileMemoria = (docente_cf, data, ora_inizio, ora_fine, sessioniEsistenti) => {
    const giorno = data.getTime();
    const startA = (0, time_utils_1.toMinutes)(ora_inizio);
    const endA = (0, time_utils_1.toMinutes)(ora_fine);
    const overlap = sessioniEsistenti.some((s) => {
        if (s.docente_cf !== docente_cf || new Date(s.data).getTime() !== giorno) {
            return false;
        }
        const startB = (0, time_utils_1.toMinutes)(s.ora_inizio);
        const endB = (0, time_utils_1.toMinutes)(s.ora_fine);
        return (0, time_utils_1.hasOverlap)(startA, endA, startB, endB);
    });
    if (overlap)
        throw new Error("Il docente è già occupato");
};
exports.checkDocenteDisponibileMemoria = checkDocenteDisponibileMemoria;
// VALIDAZIONE AULA 
const checkAulaDisponibileMemoria = (aula_id, data, ora_inizio, ora_fine, sessioniEsistenti) => {
    const giorno = data.getTime();
    const startA = (0, time_utils_1.toMinutes)(ora_inizio);
    const endA = (0, time_utils_1.toMinutes)(ora_fine);
    const overlap = sessioniEsistenti.some((s) => {
        if (s.aula_id !== aula_id || new Date(s.data).getTime() !== giorno) {
            return false;
        }
        const startB = (0, time_utils_1.toMinutes)(s.ora_inizio);
        const endB = (0, time_utils_1.toMinutes)(s.ora_fine);
        return (0, time_utils_1.hasOverlap)(startA, endA, startB, endB);
    });
    if (overlap)
        throw new Error("L'aula è già occupata");
};
exports.checkAulaDisponibileMemoria = checkAulaDisponibileMemoria;
