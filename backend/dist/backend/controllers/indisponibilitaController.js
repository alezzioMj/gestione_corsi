"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIndisponibilita = exports.updateIndisponibilita = exports.createIndisponibilita = exports.getIndisponibilitaById = exports.getIndisponibilita = void 0;
const prisma_1 = require("../prisma");
const getIndisponibilita = async (req, res) => {
    try {
        const indisponibilita = await prisma_1.prisma.indisponibilita.findMany();
        if (indisponibilita.length === 0) {
            return res.status(404).send("Nessuna indisponibilità trovata");
        }
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
        const indisponibilita = await prisma_1.prisma.indisponibilita.findUnique({
            where: { id },
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
        const { tipologia, docente_cf, sede_id, aula_id, data_inizio, data_fine, ora_inizio, ora_fine, causale, descrizione } = req.body;
        const indisponibilita = await prisma_1.prisma.indisponibilita.create({
            data: {
                tipologia,
                docente_cf,
                sede_id,
                aula_id,
                data_inizio,
                data_fine,
                ora_inizio,
                ora_fine,
                causale,
                descrizione
            }
        });
        res.status(201).json(indisponibilita);
    }
    catch (err) {
        console.error({
            message: "Errore nella creazione dell'indisponibilità",
            error: err,
        });
        res.status(500).json({ error: "Errore creazione indisponibilità" });
    }
};
exports.createIndisponibilita = createIndisponibilita;
const updateIndisponibilita = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { tipologia, docente_cf, sede_id, aula_id, data_inizio, data_fine, ora_inizio, ora_fine, causale, descrizione } = req.body;
        const indisponibilita = await prisma_1.prisma.indisponibilita.update({
            where: { id },
            data: {
                tipologia,
                docente_cf,
                sede_id,
                aula_id,
                data_inizio,
                data_fine,
                ora_inizio,
                ora_fine,
                causale,
                descrizione
            }
        });
        res.json(indisponibilita);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento dell'indisponibilità",
            error: err,
        });
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
        res.status(500).json({ error: "Errore cancellazione indisponibilità" });
    }
};
exports.deleteIndisponibilita = deleteIndisponibilita;
