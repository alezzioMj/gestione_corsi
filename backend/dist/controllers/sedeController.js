"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuleBySede = exports.getCorsiBySede = exports.deleteSede = exports.updateSede = exports.createSede = exports.getSede = exports.getSedi = void 0;
const prisma_1 = require("../prisma");
const include_1 = require("./utility.ts/include");
const INCLUDE_MAP = {
    aula: true,
    corso_sede: { include: { corso: true } },
};
const getSedi = async (req, res) => {
    try {
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const sedi = await prisma_1.prisma.sede.findMany({
            include,
        });
        res.json(sedi);
    }
    catch (error) {
        console.error("Errore nel recupero delle sedi:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getSedi = getSedi;
const getSede = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const sede = await prisma_1.prisma.sede.findUnique({
            where: { id },
            include,
        });
        if (!sede) {
            return res.status(404).send("Sede non trovata");
        }
        res.json(sede);
    }
    catch (error) {
        console.error("Errore nel recupero della sede:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getSede = getSede;
const createSede = async (req, res) => {
    try {
        const { nome, indirizzo, civico, cap, citta, provincia, descrizione, } = req.body;
        const sede = await prisma_1.prisma.sede.create({
            data: {
                nome,
                indirizzo,
                civico,
                cap,
                citta,
                provincia,
                descrizione,
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP),
        });
        res.status(201).json(sede);
    }
    catch (err) {
        console.error({
            message: "Errore nella creazione della sede",
            error: err,
        });
        // cap è Char(5) e provincia Char(2)
        if (err.code === "P2000") {
            return res.status(400).json({ error: "Valore troppo lungo (cap: 5 caratteri, provincia: 2)" });
        }
        res.status(500).json({ error: "Errore creazione sede" });
    }
};
exports.createSede = createSede;
const updateSede = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome, indirizzo, civico, cap, citta, provincia, descrizione, } = req.body;
        const sede = await prisma_1.prisma.sede.update({
            where: { id },
            data: {
                nome,
                indirizzo,
                civico,
                cap,
                citta,
                provincia,
                descrizione,
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP),
        });
        res.json(sede);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento della sede",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Sede non trovata" });
        }
        if (err.code === "P2000") {
            return res.status(400).json({ error: "Valore troppo lungo (cap: 5 caratteri, provincia: 2)" });
        }
        res.status(500).json({ error: "Errore aggiornamento sede" });
    }
};
exports.updateSede = updateSede;
// corso_sede è in cascade; aula, indisponibilita e sessione no: con righe collegate, P2003.
const deleteSede = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.sede.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione della sede",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Sede non trovata" });
        }
        if (err.code === "P2003") {
            return res.status(409).json({ error: "Impossibile eliminare la sede: ha aule, indisponibilità o sessioni collegate" });
        }
        res.status(500).json({ error: "Errore cancellazione sede" });
    }
};
exports.deleteSede = deleteSede;
const getCorsiBySede = async (req, res) => {
    try {
        const sede_id = Number(req.params.id);
        const corsi = await prisma_1.prisma.corso_sede.findMany({
            where: { sede_id },
            include: { corso: true },
        });
        res.json(corsi);
    }
    catch (err) {
        console.error({
            message: "Errore nel recupero dei corsi per sede",
            error: err,
        });
        res.status(500).json({ error: "Errore recupero corsi sede" });
    }
};
exports.getCorsiBySede = getCorsiBySede;
const getAuleBySede = async (req, res) => {
    try {
        const sede_id = Number(req.params.id);
        const aule = await prisma_1.prisma.aula.findMany({
            where: { sede_id },
        });
        res.json(aule);
    }
    catch (err) {
        console.error({
            message: "Errore nel recupero delle aule per sede",
            error: err,
        });
        res.status(500).json({ error: "Errore recupero aule sede" });
    }
};
exports.getAuleBySede = getAuleBySede;
