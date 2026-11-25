"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIndisponibilita = exports.updateIndisponibilita = exports.createIndisponibilita = exports.getIndisponibilitaById = exports.getIndisponibilita = void 0;
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
const include_1 = require("./utility.ts/include");
const date_1 = require("./utility.ts/date");
const INCLUDE_MAP = {
    docente: true,
    sede: true,
    aula: true,
};
const getIndisponibilita = async (req, res) => {
    try {
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const indisponibilita = await prisma_1.prisma.indisponibilita.findMany({
            orderBy: { data_inizio: "desc" },
            include,
        });
        res.json(indisponibilita);
    }
    catch (error) {
        console.error("Errore nel recupero delle indisponibilità:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getIndisponibilita = getIndisponibilita;
const getIndisponibilitaById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const indisponibilita = await prisma_1.prisma.indisponibilita.findUnique({
            where: { id },
            include,
        });
        if (!indisponibilita) {
            return res.status(404).send("Indisponibilità non trovata");
        }
        res.json(indisponibilita);
    }
    catch (error) {
        console.error("Errore nel recupero dell'indisponibilità:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getIndisponibilitaById = getIndisponibilitaById;
const createIndisponibilita = async (req, res) => {
    try {
        const { docente_cf, sede_id, aula_id, data_inizio, data_fine, ora_inizio, ora_fine, causale, descrizione, } = req.body;
        const indisponibilita = await prisma_1.prisma.indisponibilita.create({
            data: {
                docente_cf,
                sede_id,
                aula_id,
                data_inizio: (0, date_1.toDate)(data_inizio),
                data_fine: (0, date_1.toDate)(data_fine),
                ora_inizio,
                ora_fine,
                causale,
                descrizione,
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP),
        });
        res.status(201).json(indisponibilita);
    }
    catch (err) {
        console.error({
            message: "Errore nella creazione dell'indisponibilità",
            error: err,
        });
        if (err.code === "P2003") {
            return res.status(400).json({ error: "Il docente, la sede o l'aula selezionata non esiste" });
        }
        if (err instanceof client_1.Prisma.PrismaClientValidationError) {
            return res.status(400).json({ error: "Dati dell'indisponibilità non validi" });
        }
        res.status(500).json({ error: "Errore creazione indisponibilità" });
    }
};
exports.createIndisponibilita = createIndisponibilita;
const updateIndisponibilita = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { docente_cf, sede_id, aula_id, data_inizio, data_fine, ora_inizio, ora_fine, causale, descrizione, } = req.body;
        const indisponibilita = await prisma_1.prisma.indisponibilita.update({
            where: { id },
            data: {
                docente_cf,
                sede_id,
                aula_id,
                data_inizio: (0, date_1.toDate)(data_inizio),
                data_fine: (0, date_1.toDate)(data_fine),
                ora_inizio,
                ora_fine,
                causale,
                descrizione,
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP),
        });
        res.json(indisponibilita);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento dell'indisponibilità",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Indisponibilità non trovata" });
        }
        if (err.code === "P2003") {
            return res.status(400).json({ error: "Il docente, la sede o l'aula selezionata non esiste" });
        }
        if (err instanceof client_1.Prisma.PrismaClientValidationError) {
            return res.status(400).json({ error: "Dati dell'indisponibilità non validi" });
        }
        res.status(500).json({ error: "Errore aggiornamento indisponibilità" });
    }
};
exports.updateIndisponibilita = updateIndisponibilita;
const deleteIndisponibilita = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.indisponibilita.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione dell'indisponibilità",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Indisponibilità non trovata" });
        }
        res.status(500).json({ error: "Errore cancellazione indisponibilità" });
    }
};
exports.deleteIndisponibilita = deleteIndisponibilita;
