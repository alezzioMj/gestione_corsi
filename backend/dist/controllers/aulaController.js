"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAula = exports.updateAula = exports.createAula = exports.getAula = exports.getAule = void 0;
const prisma_1 = require("../prisma");
const include_1 = require("./utility.ts/include");
const INCLUDE_MAP = {
    sede: true
};
const getAule = async (req, res) => {
    try {
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const aule = await prisma_1.prisma.aula.findMany({
            include
        });
        res.json(aule);
    }
    catch (error) {
        console.error("Errore nel recupero delle aule:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getAule = getAule;
const getAula = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const aula = await prisma_1.prisma.aula.findUnique({
            where: { id },
            include
        });
        if (!aula) {
            return res.status(404).send("Aula non trovata");
        }
        res.json(aula);
    }
    catch (error) {
        console.error("Errore nel recupero dell'aula:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getAula = getAula;
const createAula = async (req, res) => {
    try {
        const { nome, sede_id, capienza, descrizione } = req.body;
        const aula = await prisma_1.prisma.aula.create({
            data: {
                nome,
                sede_id,
                capienza,
                descrizione
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP)
        });
        res.status(201).json(aula);
    }
    catch (err) {
        console.error({
            message: "Errore nella creazione dell'aula",
            error: err,
        });
        if (err.code === "P2002") {
            return res.status(400).json({ error: "L'aula esiste già in questa sede" });
        }
        if (err.code === "P2003") {
            return res.status(400).json({ error: "La sede selezionata non esiste" });
        }
        res.status(500).json({ error: "Errore creazione aula" });
    }
};
exports.createAula = createAula;
const updateAula = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome, sede_id, capienza, descrizione } = req.body;
        const aula = await prisma_1.prisma.aula.update({
            where: { id },
            data: {
                nome,
                sede_id,
                capienza,
                descrizione
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP)
        });
        res.json(aula);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento dell'aula",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Aula non trovata" });
        }
        if (err.code === "P2002") {
            return res.status(400).json({ error: "L'aula esiste già in questa sede" });
        }
        if (err.code === "P2003") {
            return res.status(400).json({ error: "La sede selezionata non esiste" });
        }
        res.status(500).json({ error: "Errore aggiornamento aula" });
    }
};
exports.updateAula = updateAula;
// aula -> sessione e indisponibilita non hanno cascade: se ci sono righe collegate
// Prisma risponde con P2003 (restrict).
const deleteAula = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.aula.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione dell'aula",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Aula non trovata" });
        }
        if (err.code === "P2003") {
            return res.status(409).json({ error: "Impossibile eliminare l'aula: ha sessioni o indisponibilità collegate" });
        }
        res.status(500).json({ error: "Errore cancellazione aula" });
    }
};
exports.deleteAula = deleteAula;
