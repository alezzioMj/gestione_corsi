"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSessioni = exports.deleteSedeFromCorso = exports.addSedeToCorso = exports.getSediByCorso = exports.deleteDocenteFromCorso = exports.addDocenteToCorso = exports.getDocentiByModulo = exports.getDocenti = exports.deleteCorso = exports.updateCorso = exports.createCorso = exports.getCorso = exports.getCorsi = void 0;
const prisma_1 = require("../prisma");
const include_1 = require("./utility.ts/include");
const availability_service_1 = require("../services/availability.service");
const scheduler_service_1 = require("../services/scheduler.service");
const INCLUDE_MAP = {
    programma: true,
    commessa: { include: { cliente: true } },
    corso_docente: { include: { docente: true } },
    corso_sede: { include: { sede: true } },
};
// inizio/fine sono @db.Date: Prisma vuole una Date o una ISO completa, non "2026-11-23"
const toDate = (v) => (v ? new Date(v) : v);
const getCorsi = async (req, res) => {
    try {
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const corsi = await prisma_1.prisma.corso.findMany({
            include,
        });
        res.json(corsi);
    }
    catch (error) {
        console.error("Errore nel recupero dei corsi:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getCorsi = getCorsi;
const getCorso = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const corso = await prisma_1.prisma.corso.findUnique({
            where: { id },
            include,
        });
        if (!corso) {
            return res.status(404).send("Corso non trovato");
        }
        res.json(corso);
    }
    catch (error) {
        console.error("Errore nel recupero del corso:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getCorso = getCorso;
const createCorso = async (req, res) => {
    try {
        const { nome, descrizione, commessa_id, programma_id, n_ore, inizio, fine, mattina_inizio, mattina_fine, pomeriggio_inizio, pomeriggio_fine, docenti, sedi, giorniDisponibili, ordine, } = req.body;
        if (!Array.isArray(giorniDisponibili) || !Array.isArray(ordine)) {
            return res.status(400).json({
                error: "Giorni disponibili e ordine dei moduli sono obbligatori",
            });
        }
        const ordineNormalizzato = ordine.map((item, index) => ({
            modulo_id: Number(typeof item === "string" ? item.split("-")[0] : item.modulo_id),
            ordine: index + 1,
        }));
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const corso = await tx.corso.create({
                data: {
                    nome,
                    descrizione,
                    commessa_id,
                    programma_id,
                    n_ore,
                    inizio: toDate(inizio),
                    fine: toDate(fine),
                    mattina_inizio,
                    mattina_fine,
                    pomeriggio_inizio,
                    pomeriggio_fine,
                    corso_docente: {
                        create: docenti.map((cf) => ({
                            docente: {
                                connect: {
                                    codice_fiscale: cf
                                }
                            }
                        }))
                    },
                    corso_sede: {
                        create: sedi.map((sedeId) => ({
                            sede: {
                                connect: {
                                    id: sedeId
                                }
                            }
                        }))
                    },
                },
            });
            const sessioni = await (0, scheduler_service_1.schedule)(corso.id, giorniDisponibili, ordineNormalizzato, tx);
            return { corso, sessioni };
        });
        // La transazione è stata completata
        return res.status(201).json({
            message: "Corso creato e schedulato con successo",
            corso: result.corso,
            sessioni_create: result.sessioni.length,
            sessioni: result.sessioni,
        });
    }
    catch (err) {
        if (err instanceof availability_service_1.SchedulingError) {
            return res.status(err.status).json({
                code: err.code,
                message: err.message,
                details: err.details,
            });
        }
        console.error("Errore nella creazione del corso:", err);
        if (err.code === "P2002") {
            return res.status(400).json({ error: "Il corso esiste già" });
        }
        if (err.code === "P2003") {
            return res.status(400).json({
                error: "La commessa, il programma o una relazione selezionata non esiste",
            });
        }
        return res.status(500).json({
            error: "Errore nella creazione e schedulazione del corso",
        });
    }
};
exports.createCorso = createCorso;
const updateCorso = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome, descrizione, commessa_id, programma_id, n_ore, inizio, fine, mattina_inizio, mattina_fine, pomeriggio_inizio, pomeriggio_fine, } = req.body;
        const corso = await prisma_1.prisma.corso.update({
            where: { id },
            data: {
                nome,
                descrizione,
                commessa_id,
                programma_id,
                n_ore,
                inizio: toDate(inizio),
                fine: toDate(fine),
                mattina_inizio,
                mattina_fine,
                pomeriggio_inizio,
                pomeriggio_fine,
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP),
        });
        res.json(corso);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento del corso",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Corso non trovato" });
        }
        if (err.code === "P2003") {
            return res.status(400).json({ error: "La commessa o il programma selezionato non esiste" });
        }
        res.status(500).json({ error: "Errore aggiornamento corso" });
    }
};
exports.updateCorso = updateCorso;
const deleteCorso = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.corso.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione del corso",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Corso non trovato" });
        }
        res.status(500).json({ error: "Errore cancellazione corso" });
    }
};
exports.deleteCorso = deleteCorso;
const getDocenti = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const docenti = await prisma_1.prisma.corso_docente.findMany({
            where: { corso_id: id },
            include: { docente: true },
        });
        res.json(docenti);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca dei docenti",
            error: err,
        });
        res.status(500).json({ error: "Errore ricerca docenti" });
    }
};
exports.getDocenti = getDocenti;
const getDocentiByModulo = async (req, res) => {
    try {
        const corso_id = Number(req.params.id);
        const modulo_id = Number(req.params.modulo_id);
        // docenti del corso abilitati al modulo, in una query sola
        const docenti = await prisma_1.prisma.corso_docente.findMany({
            where: {
                corso_id,
                docente: { docente_modulo: { some: { modulo_id } } },
            },
            include: { docente: true },
        });
        res.json(docenti);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca dei docenti per questo modulo",
            error: err,
        });
        res.status(500).json({ error: "Errore ricerca docenti per modulo" });
    }
};
exports.getDocentiByModulo = getDocentiByModulo;
const addDocenteToCorso = async (req, res) => {
    try {
        const corso_id = Number(req.params.id);
        const { docenti_cfs } = req.body;
        if (!docenti_cfs || !Array.isArray(docenti_cfs)) {
            return res.status(400).json({ error: "Formato dati non valido. Previsto array docenti_cfs" });
        }
        const result = await prisma_1.prisma.corso_docente.createMany({
            data: docenti_cfs.map((cf) => ({
                corso_id,
                docente_cf: cf,
                n_ore: null, // non ancora assegnate, aggiornabili in seguito
            })),
            skipDuplicates: true,
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error({
            message: "Errore nell'assegnazione dei docenti al corso",
            error: err,
        });
        if (err.code === "P2003") {
            return res.status(400).json({ error: "Il corso o uno dei docenti non esiste" });
        }
        res.status(500).json({ error: "Errore assegnazione docenti" });
    }
};
exports.addDocenteToCorso = addDocenteToCorso;
const deleteDocenteFromCorso = async (req, res) => {
    try {
        const corso_id = Number(req.params.id);
        const { docente_cf } = req.params;
        await prisma_1.prisma.corso_docente.delete({
            where: {
                corso_id_docente_cf: { corso_id, docente_cf },
            },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione del docente dal corso",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Docente non assegnato a questo corso" });
        }
        res.status(500).json({ error: "Errore cancellazione docente" });
    }
};
exports.deleteDocenteFromCorso = deleteDocenteFromCorso;
const getSediByCorso = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const sedi = await prisma_1.prisma.corso_sede.findMany({
            where: { corso_id: id },
            include: { sede: true },
        });
        res.json(sedi);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca delle sedi per questo corso",
            error: err,
        });
        res.status(500).json({ error: "Errore ricerca sedi" });
    }
};
exports.getSediByCorso = getSediByCorso;
// Riceve gli id delle sedi (sede.nome non è univoco)
const addSedeToCorso = async (req, res) => {
    try {
        const corso_id = Number(req.params.id);
        const { sedi_ids } = req.body;
        if (!sedi_ids || !Array.isArray(sedi_ids)) {
            return res.status(400).json({ error: "Formato dati non valido. Previsto array sedi_ids" });
        }
        const result = await prisma_1.prisma.corso_sede.createMany({
            data: sedi_ids.map((sede_id) => ({ corso_id, sede_id })),
            skipDuplicates: true,
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error({
            message: "Errore nell'assegnazione delle sedi al corso",
            error: err,
        });
        if (err.code === "P2003") {
            return res.status(400).json({ error: "Il corso o una delle sedi non esiste" });
        }
        res.status(500).json({ error: "Errore assegnazione sedi" });
    }
};
exports.addSedeToCorso = addSedeToCorso;
const deleteSedeFromCorso = async (req, res) => {
    try {
        const corso_id = Number(req.params.corso_id);
        const sede_id = Number(req.params.sede_id);
        await prisma_1.prisma.corso_sede.delete({
            where: {
                corso_id_sede_id: { corso_id, sede_id },
            },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione della sede dal corso",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Sede non assegnata a questo corso" });
        }
        res.status(500).json({ error: "Errore cancellazione sede" });
    }
};
exports.deleteSedeFromCorso = deleteSedeFromCorso;
const deleteSessioni = async (req, res) => {
    try {
        const corso_id = Number(req.params.id);
        await prisma_1.prisma.sessione.deleteMany({
            where: { corso_id },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione delle sessioni",
            error: err,
        });
        res.status(500).json({ error: "Errore cancellazione sessioni" });
    }
};
exports.deleteSessioni = deleteSessioni;
