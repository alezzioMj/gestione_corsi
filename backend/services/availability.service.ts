import { aula, docente } from "@prisma/client";
import { calculateHours, toMinutes, hasOverlap } from "../utils/time.utils";
import { Indisponibilita } from "@progetto/shared/validation/indisponibilita.schema";
import { SessioneWithRelations } from "@progetto/shared/validation/sessione.schema";

export type Slot = {
    data: Date;
    ora_inizio: string;
    ora_fine: string;
    durata: number;
};

export type Ordine = {
    modulo_id: number;
    ordine: number;
};

export type SessioneCache = Pick<
    SessioneWithRelations,
    "docente_cf" | "aula_id" | "data" | "ora_inizio" | "ora_fine"
> & { id?: number };

type Finestra = { data: Date | string; ora_inizio: string; ora_fine: string };

export type SchedulingCode =
    | "DOCENTE_INDISPONIBILE"
    | "DOCENTE_OCCUPATO"
    | "AULA_INDISPONIBILE"
    | "AULA_OCCUPATA"
    | "SEDE_INDISPONIBILE";

export type Conflitto = {
    code: SchedulingCode;
    status: number;
    message: string;
    details: Record<string, unknown>;
};

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

const MINUTI_GIORNO = 24 * 60;

export const dayKey = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

const indisponibilitaCopreSlot = (
    i: Indisponibilita,
    data: Date | string,
    startSlot: number,
    endSlot: number
): boolean => {
    const giorno = dayKey(data);
    const primo = dayKey(i.data_inizio);
    const ultimo = dayKey(i.data_fine);

    if (giorno < primo || giorno > ultimo) return false;

    let da = giorno === primo ? toMinutes(i.ora_inizio) : 0;
    let a = giorno === ultimo ? toMinutes(i.ora_fine) : MINUTI_GIORNO;

    if (da >= a) {
        da = 0;
        a = MINUTI_GIORNO;
    }

    return hasOverlap(startSlot, endSlot, da, a);
};

const trovaIndisponibilita = (
    indisponibilita: Indisponibilita[],
    match: (i: Indisponibilita) => boolean,
    data: Date | string,
    startSlot: number,
    endSlot: number
) => indisponibilita.find((i) => match(i) && indisponibilitaCopreSlot(i, data, startSlot, endSlot));

// ---------------------------------------------------------------------------
// Generazione slot
// ---------------------------------------------------------------------------

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

    const cursor = new Date(inizio); // copia: il chiamante non vede cambiare "inizio"
    const ultimo = fine.getTime();

    while (cursor.getTime() <= ultimo) {
        const day = cursor.getUTCDay();
        const normalizedDay = day === 0 ? 7 : day;

        if (giorniDisponibili.includes(normalizedDay)) {
            slots.push({
                data: new Date(cursor),
                ora_inizio: mattino_inizio,
                ora_fine: mattino_fine,
                durata: durataMattina,
            });

            slots.push({
                data: new Date(cursor),
                ora_inizio: pomeriggio_inizio,
                ora_fine: pomeriggio_fine,
                durata: durataPomeriggio,
            });
        }

        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return slots;
};

// ---------------------------------------------------------------------------
// Conflitti (restituiti come dati, non lanciati come eccezioni)
// ---------------------------------------------------------------------------

const sovrappone = (s: SessioneCache, w: Finestra, start: number, end: number) =>
    dayKey(s.data) === dayKey(w.data) &&
    hasOverlap(start, end, toMinutes(s.ora_inizio), toMinutes(s.ora_fine));

export const conflittiDocente = (
    docente_cf: string,
    w: Finestra,
    sessioniEsistenti: SessioneCache[],
    indisponibilita: Indisponibilita[]
): Conflitto[] => {
    const start = toMinutes(w.ora_inizio);
    const end = toMinutes(w.ora_fine);
    const conflitti: Conflitto[] = [];

    const ind = trovaIndisponibilita(indisponibilita, (i) => i.docente_cf === docente_cf, w.data, start, end);
    if (ind) {
        conflitti.push({
            code: "DOCENTE_INDISPONIBILE",
            status: 409,
            message: "Il docente risulta indisponibile in questo slot",
            details: { docente_cf, ...w, causale: ind.causale },
        });
    }

    if (sessioniEsistenti.some((s) => s.docente_cf === docente_cf && sovrappone(s, w, start, end))) {
        conflitti.push({
            code: "DOCENTE_OCCUPATO",
            status: 409,
            message: "Il docente è già occupato in questo slot",
            details: { docente_cf, ...w },
        });
    }

    return conflitti;
};

export const conflittiAula = (
    aula_id: number,
    w: Finestra,
    sessioniEsistenti: SessioneCache[],
    indisponibilita: Indisponibilita[]
): Conflitto[] => {
    const start = toMinutes(w.ora_inizio);
    const end = toMinutes(w.ora_fine);
    const conflitti: Conflitto[] = [];

    const ind = trovaIndisponibilita(indisponibilita, (i) => i.aula_id === aula_id, w.data, start, end);
    if (ind) {
        conflitti.push({
            code: "AULA_INDISPONIBILE",
            status: 409,
            message: "L'aula risulta indisponibile in questo slot",
            details: { aula_id, ...w, causale: ind.causale },
        });
    }

    if (sessioniEsistenti.some((s) => s.aula_id === aula_id && sovrappone(s, w, start, end))) {
        conflitti.push({
            code: "AULA_OCCUPATA",
            status: 409,
            message: "L'aula è già occupata in questo slot",
            details: { aula_id, ...w },
        });
    }

    return conflitti;
};

export const conflittiSede = (
    sede_id: number,
    w: Finestra,
    indisponibilita: Indisponibilita[]
): Conflitto[] => {
    const ind = trovaIndisponibilita(
        indisponibilita,
        (i) => i.sede_id === sede_id,
        w.data,
        toMinutes(w.ora_inizio),
        toMinutes(w.ora_fine)
    );

    return ind
        ? [{
            code: "SEDE_INDISPONIBILE",
            status: 409,
            message: "La sede risulta indisponibile in questo slot",
            details: { sede_id, ...w, causale: ind.causale },
        }]
        : [];
};

export type SessioneDaVerificare = Finestra & {
    id?: number;
    docente_cf: string;
    aula_id: number;
    sede_id: number;
};

export const verificaSessioni = (
    sessioni: SessioneDaVerificare[],
    cache: SessioneCache[],
    indisponibilita: Indisponibilita[]
) =>
    sessioni.map((s) => {
        const altre = s.id !== undefined ? cache.filter((c) => c.id !== s.id) : cache;
        return {
            id: s.id,
            conflitti: [
                ...conflittiDocente(s.docente_cf, s, altre, indisponibilita),
                ...conflittiAula(s.aula_id, s, altre, indisponibilita),
                ...conflittiSede(s.sede_id, s, indisponibilita), // una sola volta, non per docente e aula
            ],
        };
    });


export const findDocente = (
    listaDocenti: docente[],
    slot: Finestra,
    sede_id: number,
    cacheSessioni: SessioneCache[],
    indisponibilita: Indisponibilita[]
): docente | null => {
    if (conflittiSede(sede_id, slot, indisponibilita).length > 0) return null;

    return (
        listaDocenti.find(
            (d) => conflittiDocente(d.codice_fiscale, slot, cacheSessioni, indisponibilita).length === 0
        ) ?? null
    );
};

export const findAula = (
    listaAule: aula[],
    slot: Finestra,
    cacheSessioni: SessioneCache[],
    indisponibilita: Indisponibilita[]
): aula | null =>
    listaAule.find(
        (a) =>
            conflittiSede(a.sede_id, slot, indisponibilita).length === 0 &&
            conflittiAula(a.id, slot, cacheSessioni, indisponibilita).length === 0
    ) ?? null;

const lanciaPrimo = (conflitti: Conflitto[]) => {
    const [primo] = conflitti;
    if (primo) throw new SchedulingError(primo.code, primo.status, primo.message, primo.details);
};

export const checkDocenteDisponibileMemoria = (
    docente_cf: string,
    data: Date,
    ora_inizio: string,
    ora_fine: string,
    sede_id: number,
    sessioniEsistenti: SessioneCache[],
    indisponibilita: Indisponibilita[]
) => {
    const w = { data, ora_inizio, ora_fine };
    lanciaPrimo([
        ...conflittiDocente(docente_cf, w, sessioniEsistenti, indisponibilita),
        ...conflittiSede(sede_id, w, indisponibilita),
    ]);
};

export const checkAulaDisponibileMemoria = (
    aula_id: number,
    sede_id: number,
    data: Date,
    ora_inizio: string,
    ora_fine: string,
    sessioniEsistenti: SessioneCache[],
    indisponibilita: Indisponibilita[]
) => {
    const w = { data, ora_inizio, ora_fine };
    lanciaPrimo([
        ...conflittiAula(aula_id, w, sessioniEsistenti, indisponibilita),
        ...conflittiSede(sede_id, w, indisponibilita),
    ]);
};