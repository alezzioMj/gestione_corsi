"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuleBySede = exports.getCorsiBySede = exports.deleteSede = exports.updateSede = exports.createSede = exports.getSede = exports.getSedi = void 0;
const prisma_1 = require("../prisma");
const getSedi = async (req, res) => {
    try {
        const sedi = await prisma_1.prisma.sede.findMany();
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
        // Trova la sede usando Prisma
        const sede = await prisma_1.prisma.sede.findUnique({
            where: { id },
            include: {
                aula: true,
            },
        });
        // Se la sede non viene trovata ritorna un 404
        if (!sede) {
            return res.status(404).send("Sede non trovata");
        }
        // Restituisci i dati della sede
        res.json(sede);
    }
    catch (error) {
        // Gestione errori Prisma o runtime
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
                descrizione
            }
        });
        res.status(201).json(sede);
    }
    catch (err) {
        console.error({
            message: "Errore nella creazione della sede",
            error: err,
        });
        if (err.code === "P2002") {
            return res.status(400).json({ error: "La sede esiste già" });
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
            }
        });
        res.json(sede);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento della sede",
            error: err,
        });
        res.status(500).json({ error: "Errore aggiornamento sede" });
    }
};
exports.updateSede = updateSede;
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
        res.status(500).json({ error: "Errore cancellazione sede" });
    }
};
exports.deleteSede = deleteSede;
const getCorsiBySede = async (req, res) => {
    try {
        const sede_id = Number(req.params.id);
        const corsi = await prisma_1.prisma.corso_sede.findMany({
            where: {
                sede_id,
            },
            include: {
                corso: true,
            },
        });
        res.status(200).json(corsi);
    }
    catch (err) {
        console.error("Errore nel recupero corsi per sede", err);
        res.status(500).json({ error: "Errore server" });
    }
};
exports.getCorsiBySede = getCorsiBySede;
const getAuleBySede = async (req, res) => {
    try {
        const sede_id = Number(req.params.id);
        const aule = await prisma_1.prisma.aula.findMany({
            where: {
                sede_id,
            },
        });
        if (aule.length === 0) {
            return res.status(404).send("Nessuna aula trovata per questa sede");
        }
        res.status(200).json(aule);
    }
    catch (error) {
        console.error("Errore nel recupero delle aule per sede:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getAuleBySede = getAuleBySede;
