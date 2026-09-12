import { aula, docente } from "@prisma/client";
import { calculateHours, toMinutes, hasOverlap } from "../utils/time.utils"

type Slot = {
    data: Date;
    ora_inizio: string;
    ora_fine: string;
    durata: number;
};

export type Ordine = {
    modulo_id: number;
    ordine: number;
}

export class SchedulingError extends Error {
    constructor(
        public code: string,
        public status: number,
        message: string,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = "SchedulingError";
    }
}

export const generateSlots = (
    inizio: Date,
    fine: Date,
    mattino_inizio: string,
    mattino_fine: string,
    pomeriggio_inizio: string,
    pomeriggio_fine: string,
    giorniDisponibili: number[]
): Slot[] => {
    const slots: Slot[] = [];
    const durataMattina = calculateHours(mattino_inizio, mattino_fine);
    const durataPomeriggio = calculateHours(pomeriggio_inizio, pomeriggio_fine);

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

// VALIDAZIONE DOCENTE 
export const findDocente = async (
    listaDocenti: docente[],
    slot: { data: Date; ora_inizio: string; ora_fine: string },
    cacheSessioni: any[] // Le sessioni caricate all'inizio + quelle create al volo
) => {
    for (const docente of listaDocenti) {
        try {
            // Controlla la disponibilità del docente usando la cache delle sessioni
            checkDocenteDisponibileMemoria(
                docente.codice_fiscale,
                slot.data,
                slot.ora_inizio,
                slot.ora_fine,
                cacheSessioni
            );
            return docente;
        } catch (err: any) {
            if (err instanceof SchedulingError) {
                continue; // try another one
            }
            throw err;
        }
    }
    return null;
};

// VALIDAZIONE AULA VELOCE
export const findAula = async (
    listaAule: aula[],
    slot: { data: Date; ora_inizio: string; ora_fine: string },
    cacheSessioni: any[]
) => {
    for (const aula of listaAule) {
        try {
            // Controlla la disponibilità dell'aula usando la cache delle sessioni
            checkAulaDisponibileMemoria(
                aula.id,
                slot.data,
                slot.ora_inizio,
                slot.ora_fine,
                cacheSessioni
            );
            // Se non lancia errori, l'aula è disponibile
            return aula;
        } catch (err: any) {
            if (err instanceof SchedulingError) {
                continue; // try another one
            }
            throw err;
        }
    }
    return null;
};

// VALIDAZIONE DOCENTE 
export const checkDocenteDisponibileMemoria = (
    docente_cf: string,
    data: Date,
    ora_inizio: string,
    ora_fine: string,
    sessioniEsistenti: any[]
) => {
    const giorno = data.getTime();
    const startA = toMinutes(ora_inizio);
    const endA = toMinutes(ora_fine);

    const overlap = sessioniEsistenti.some((s) => {
        if (s.docente_cf !== docente_cf || new Date(s.data).getTime() !== giorno) {
            return false;
        }

        const startB = toMinutes(s.ora_inizio);
        const endB = toMinutes(s.ora_fine);
        return hasOverlap(startA, endA, startB, endB);
    });

    if (overlap) throw new SchedulingError(
        "TEACHER_UNAVAILABLE",
        409,
        "Il docente è già occupato in questo slot",
        { docente_cf, data, ora_inizio, ora_fine }
    );
};

// VALIDAZIONE AULA 
export const checkAulaDisponibileMemoria = (
    aula_id: number,
    data: Date,
    ora_inizio: string,
    ora_fine: string,
    sessioniEsistenti: any[]
) => {
    const giorno = data.getTime();
    const startA = toMinutes(ora_inizio);
    const endA = toMinutes(ora_fine);

    const overlap = sessioniEsistenti.some((s) => {
        if (s.aula_id !== aula_id || new Date(s.data).getTime() !== giorno) {
            return false;
        }

        const startB = toMinutes(s.ora_inizio);
        const endB = toMinutes(s.ora_fine);
        return hasOverlap(startA, endA, startB, endB);
    });

    if (overlap) throw new SchedulingError(
        "AULA_UNAVAILABLE",
        409,
        "L'aula è già occupata in questo slot",
        { aula_id, data, ora_inizio, ora_fine }
    );
};