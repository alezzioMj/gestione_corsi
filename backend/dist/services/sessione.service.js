"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSessioneService = exports.updateSessioneService = exports.createSessioneMany = exports.createSessioneService = exports.validateAulaDisponibile = exports.validateDocenteDisponibile = exports.getSessioniFullService = exports.getSessioneService = exports.getSessioniService = void 0;
const prisma_1 = require("../prisma");
const time_utils_1 = require("../utils/time.utils");
// =======================
// GET
// =======================
const getSessioniService = async () => {
    return prisma_1.prisma.sessione.findMany({
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
exports.getSessioniService = getSessioniService;
const getSessioneService = async (id) => {
    return prisma_1.prisma.sessione.findUnique({
        where: { id },
    });
};
exports.getSessioneService = getSessioneService;
const getSessioniFullService = async () => {
    return prisma_1.prisma.sessione.findMany({
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
exports.getSessioniFullService = getSessioniFullService;
// =======================
// VALIDAZIONI BASE
// =======================
const validateOrari = (ora_inizio, ora_fine) => {
    if ((0, time_utils_1.toMinutes)(ora_inizio) >= (0, time_utils_1.toMinutes)(ora_fine)) {
        throw new Error("Orario non valido");
    }
};
// =======================
// DOCENTE DISPONIBILE
// =======================
const validateDocenteDisponibile = async (docente_cf, data, ora_inizio, ora_fine, excludeId) => {
    const giorno = data;
    const where = {
        docente_cf,
        data: giorno,
    };
    if (excludeId) {
        where.id = { not: excludeId };
    }
    const sessions = await prisma_1.prisma.sessione.findMany({ where });
    const startA = (0, time_utils_1.toMinutes)(ora_inizio);
    const endA = (0, time_utils_1.toMinutes)(ora_fine);
    const overlap = sessions.some((s) => {
        const startB = (0, time_utils_1.toMinutes)(s.ora_inizio);
        const endB = (0, time_utils_1.toMinutes)(s.ora_fine);
        const result = (0, time_utils_1.hasOverlap)(startA, endA, startB, endB);
        return result;
    });
    if (overlap) {
        throw new Error("Il docente è già occupato in questo orario");
    }
};
exports.validateDocenteDisponibile = validateDocenteDisponibile;
// =======================
// AULA DISPONIBILE
// =======================
const validateAulaDisponibile = async (aula_id, data, ora_inizio, ora_fine, excludeId) => {
    const giorno = data;
    const where = {
        aula_id,
        data: giorno,
    };
    if (excludeId) {
        where.id = { not: excludeId };
    }
    const sessions = await prisma_1.prisma.sessione.findMany({ where });
    const startA = (0, time_utils_1.toMinutes)(ora_inizio);
    const endA = (0, time_utils_1.toMinutes)(ora_fine);
    const overlap = sessions.find((s) => {
        const startB = (0, time_utils_1.toMinutes)(s.ora_inizio);
        const endB = (0, time_utils_1.toMinutes)(s.ora_fine);
        return (0, time_utils_1.hasOverlap)(startA, endA, startB, endB);
    });
    if (overlap) {
        throw new Error("L'aula è già occupata in questo orario");
    }
};
exports.validateAulaDisponibile = validateAulaDisponibile;
// =======================
// SEDE ↔ CORSO
// =======================
const validateSedeCorso = async (corso_id, sede_id) => {
    const relazione = await prisma_1.prisma.corso_sede.findFirst({
        where: { corso_id, sede_id },
    });
    if (!relazione) {
        throw new Error("La sede non è associata al corso");
    }
};
// =======================
// AULA ↔ SEDE
// =======================
const validateAulaSede = async (aula_id, sede_id) => {
    const aula = await prisma_1.prisma.aula.findUnique({
        where: { id: aula_id },
        select: { sede_id: true },
    });
    if (!aula)
        throw new Error("Aula non trovata");
    if (aula.sede_id !== sede_id) {
        throw new Error("L'aula non appartiene alla sede");
    }
};
// =======================
// INDISPONIBILITÀ
// =======================
const validateDisponibilita = async (docente_cf, aula_id, sede_id, data, ora_inizio, ora_fine) => {
    const giorno = data;
    const startA = (0, time_utils_1.toMinutes)(ora_inizio);
    const endA = (0, time_utils_1.toMinutes)(ora_fine);
    const indisponibilita = await prisma_1.prisma.indisponibilita.findMany({
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
        const startB = (0, time_utils_1.toMinutes)(i.ora_inizio);
        const endB = (0, time_utils_1.toMinutes)(i.ora_fine);
        return (0, time_utils_1.hasOverlap)(startA, endA, startB, endB);
    });
    if (conflict) {
        throw new Error("Risorsa non disponibile in questo orario");
    }
};
// =======================
// CREATE
// =======================
const createSessioneService = async (data) => {
    const { corso_id, docente_cf, modulo_id, sede_id, aula_id, data: giorno, ora_inizio, ora_fine, stato, priorita, note, } = data;
    validateOrari(ora_inizio, ora_fine);
    return await prisma_1.prisma.$transaction(async (tx) => {
        await validateSedeCorso(corso_id, sede_id);
        await validateAulaSede(aula_id, sede_id);
        await (0, exports.validateDocenteDisponibile)(docente_cf, giorno, ora_inizio, ora_fine);
        // Verifica disponibilità dell'aula
        await (0, exports.validateAulaDisponibile)(aula_id, giorno, ora_inizio, ora_fine);
        // Verifica eventuali indisponibilità su risorse collegate
        await validateDisponibilita(docente_cf, aula_id, sede_id, giorno, ora_inizio, ora_fine);
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
exports.createSessioneService = createSessioneService;
const createSessioneMany = async (sessioni) => {
    // Pulizia e normalizzazione
    const dataToInsert = sessioni.map(s => ({
        ...s,
        data: s.data,
    }));
    return await prisma_1.prisma.sessione.createMany({
        data: dataToInsert,
        skipDuplicates: false,
    });
};
exports.createSessioneMany = createSessioneMany;
// =======================
// UPDATE
// =======================
const updateSessioneService = async (id, data) => {
    const { corso_id, docente_cf, modulo_id, sede_id, aula_id, data: giorno, ora_inizio, ora_fine, stato, priorita, note, } = data;
    validateOrari(ora_inizio, ora_fine);
    return await prisma_1.prisma.$transaction(async (tx) => {
        // Validazione corso ↔ sede
        await validateSedeCorso(corso_id, sede_id);
        // Validazione aula ↔ sede
        await validateAulaSede(aula_id, sede_id);
        // Verifica disponibilità del docente (escludendo la sessione che stiamo aggiornando)
        await (0, exports.validateDocenteDisponibile)(docente_cf, giorno, ora_inizio, ora_fine, id);
        // Verifica disponibilità dell'aula (escludendo la sessione che stiamo aggiornando)
        await (0, exports.validateAulaDisponibile)(aula_id, giorno, ora_inizio, ora_fine, id);
        // Verifica eventuali indisponibilità
        await validateDisponibilita(docente_cf, aula_id, sede_id, giorno, ora_inizio, ora_fine);
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
exports.updateSessioneService = updateSessioneService;
// =======================
// DELETE
// =======================
const deleteSessioneService = async (id) => {
    return prisma_1.prisma.sessione.delete({
        where: { id },
    });
};
exports.deleteSessioneService = deleteSessioneService;
