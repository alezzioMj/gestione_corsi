import { sessione } from "@prisma/client";
import { prisma } from "../prisma";
import { toMinutes, hasOverlap } from "../utils/time.utils"

// =======================
// GET
// =======================

export const getSessioniService = async () => {
    return prisma.sessione.findMany({
        orderBy: [
            {
                data: "asc",
            },
            {
                ora_inizio: "asc",
            },
        ],
    });
};

export const getSessioneService = async (id: number) => {
    return prisma.sessione.findUnique({
        where: { id },
    });
};

export const getSessioniFullService = async () => {
    return prisma.sessione.findMany({
        orderBy: [
            {
                data: "asc",
            },
            {
                ora_inizio: "asc",
            },
        ],
        include: {
            corso: true,
            docente: true,
            aula: true,
            sede: true,
            modulo: true
        },
    });
};

// =======================
// VALIDAZIONI BASE
// =======================

const validateOrari = (ora_inizio: string, ora_fine: string) => {
    if (toMinutes(ora_inizio) >= toMinutes(ora_fine)) {
        throw new Error("Orario non valido");
    }
};

// =======================
// DOCENTE DISPONIBILE
// =======================

export const validateDocenteDisponibile = async (
    docente_cf: string,
    data: Date,
    ora_inizio: string,
    ora_fine: string,
    excludeId?: number
) => {
    const giorno = data;

    const where: any = {
        docente_cf,
        data: giorno,
    };

    if (excludeId) {
        where.id = { not: excludeId };
    }

    const sessions = await prisma.sessione.findMany({ where });
    const startA = toMinutes(ora_inizio);
    const endA = toMinutes(ora_fine);

    const overlap = sessions.some((s) => {
        const startB = toMinutes(s.ora_inizio);
        const endB = toMinutes(s.ora_fine);

        const result = hasOverlap(startA, endA, startB, endB);
        return result;
    });

    if (overlap) {
        throw new Error("Il docente è già occupato in questo orario");
    }

};

// =======================
// AULA DISPONIBILE
// =======================

export const validateAulaDisponibile = async (
    aula_id: number,
    data: Date,
    ora_inizio: string,
    ora_fine: string,
    excludeId?: number
) => {
    const giorno = data;

    const where: any = {
        aula_id,
        data: giorno,
    };

    if (excludeId) {
        where.id = { not: excludeId };
    }

    const sessions = await prisma.sessione.findMany({ where });

    const startA = toMinutes(ora_inizio);
    const endA = toMinutes(ora_fine);

    const overlap = sessions.find((s) => {
        const startB = toMinutes(s.ora_inizio);
        const endB = toMinutes(s.ora_fine);
        return hasOverlap(startA, endA, startB, endB);
    });

    if (overlap) {
        throw new Error("L'aula è già occupata in questo orario");
    }
};

// =======================
// SEDE ↔ CORSO
// =======================

const validateSedeCorso = async (corso_id: number, sede_id: number) => {
    const relazione = await prisma.corso_sede.findFirst({
        where: { corso_id, sede_id },
    });

    if (!relazione) {
        throw new Error("La sede non è associata al corso");
    }
};

// =======================
// AULA ↔ SEDE
// =======================

const validateAulaSede = async (aula_id: number, sede_id: number) => {
    const aula = await prisma.aula.findUnique({
        where: { id: aula_id },
        select: { sede_id: true },
    });

    if (!aula) throw new Error("Aula non trovata");

    if (aula.sede_id !== sede_id) {
        throw new Error("L'aula non appartiene alla sede");
    }
};

// =======================
// INDISPONIBILITÀ
// =======================

const validateDisponibilita = async (
    docente_cf: string,
    aula_id: number,
    sede_id: number,
    data: Date,
    ora_inizio: string,
    ora_fine: string
) => {
    const giorno = data;

    const startA = toMinutes(ora_inizio);
    const endA = toMinutes(ora_fine);

    const indisponibilita = await prisma.indisponibilita.findMany({
        where: {
            OR: [
                { docente_cf },
                { aula_id },
                { sede_id },
            ],
            data_inizio: { lte: giorno },
            data_fine: { gte: giorno },
        },
    });

    const conflict = indisponibilita.find((i) => {
        const startB = toMinutes(i.ora_inizio);
        const endB = toMinutes(i.ora_fine);
        return hasOverlap(startA, endA, startB, endB);
    });

    if (conflict) {
        throw new Error("Risorsa non disponibile in questo orario");
    }
};

// =======================
// CREATE
// =======================

export const createSessioneService = async (data: any) => {
    const {
        corso_id,
        docente_cf,
        modulo_id,
        sede_id,
        aula_id,
        data: giorno,
        ora_inizio,
        ora_fine,
        stato,
        priorita,
        note,
    } = data;
    validateOrari(ora_inizio, ora_fine);

    // Usa `prisma.$transaction` per raggruppare tutte le operazioni atomiche
    return await prisma.$transaction(async (tx) => {
        // Validazione corso ↔ sede
        await validateSedeCorso(corso_id, sede_id);

        // Validazione aula ↔ sede
        await validateAulaSede(aula_id, sede_id);

        // Verifica disponibilità del docente
        await validateDocenteDisponibile(
            docente_cf,
            giorno,
            ora_inizio,
            ora_fine
        );

        // Verifica disponibilità dell'aula
        await validateAulaDisponibile(
            aula_id,
            giorno,
            ora_inizio,
            ora_fine
        );

        // Verifica eventuali indisponibilità su risorse collegate
        await validateDisponibilita(
            docente_cf,
            aula_id,
            sede_id,
            giorno,
            ora_inizio,
            ora_fine
        );

        // Se tutto è valido, crea la sessione
        return tx.sessione.create({
            data: {
                corso_id,
                docente_cf,
                modulo_id,
                sede_id,
                aula_id,
                data: giorno,
                ora_inizio,
                ora_fine,
                stato,
                priorita,
                note,
            },
        });
    });
};

export const createSessioneMany = async (sessioni: any[]) => {
    // Pulizia e normalizzazione
    const dataToInsert = sessioni.map(s => ({
        ...s,
        data: s.data,
    }));

    return await prisma.sessione.createMany({
        data: dataToInsert,
        skipDuplicates: false,
    });
};
// =======================
// UPDATE
// =======================

export const updateSessioneService = async (id: number, data: any) => {
    const {
        corso_id,
        docente_cf,
        modulo_id,
        sede_id,
        aula_id,
        data: giorno,
        ora_inizio,
        ora_fine,
        stato,
        priorita,
        note,
    } = data;

    validateOrari(ora_inizio, ora_fine);

    return await prisma.$transaction(async (tx) => {
        // Validazione corso ↔ sede
        await validateSedeCorso(corso_id, sede_id);

        // Validazione aula ↔ sede
        await validateAulaSede(aula_id, sede_id);

        // Verifica disponibilità del docente (escludendo la sessione che stiamo aggiornando)
        await validateDocenteDisponibile(
            docente_cf,
            giorno,
            ora_inizio,
            ora_fine,
            id
        );

        // Verifica disponibilità dell'aula (escludendo la sessione che stiamo aggiornando)
        await validateAulaDisponibile(
            aula_id,
            giorno,
            ora_inizio,
            ora_fine,
            id
        );

        // Verifica eventuali indisponibilità
        await validateDisponibilita(
            docente_cf,
            aula_id,
            sede_id,
            giorno,
            ora_inizio,
            ora_fine
        );

        // Aggiorna la sessione
        return tx.sessione.update({
            where: { id },
            data: {
                corso_id,
                docente_cf,
                modulo_id,
                sede_id,
                aula_id,
                data: giorno,
                ora_inizio,
                ora_fine,
                stato,
                priorita,
                note,
            },
        });
    });
};

// =======================
// DELETE
// =======================

export const deleteSessioneService = async (id: number) => {
    return prisma.sessione.delete({
        where: { id },
    });
};