"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommessa = exports.updateCommessa = exports.createCommessa = exports.getCommesse = void 0;
const prisma_1 = require("../prisma");
const getCommesse = async (req, res) => {
    try {
        const commesse = await prisma_1.prisma.commessa.findMany({
            orderBy: { scadenza: "asc" },
            include: { cliente: true }
        });
        res.json(commesse);
    }
    catch (error) {
        console.error(error);
        res.status(500).json("Errore del server");
    }
};
exports.getCommesse = getCommesse;
const createCommessa = async (req, res) => {
    const { codice_commessa, codice_ft, codice_rlom, descrizione, scadenza, cliente_id, stato } = req.body;
    try {
        const commessa = await prisma_1.prisma.commessa.create({
            data: {
                codice_commessa,
                codice_ft,
                codice_rlom,
                descrizione,
                scadenza,
                cliente_id,
                stato
            },
            include: { cliente: true }
        });
        res.status(201).json(commessa);
    }
    catch (error) {
        console.error(error);
        res.status(500).json("Errore nella creazione della commessa");
    }
};
exports.createCommessa = createCommessa;
const updateCommessa = async (req, res) => {
    const id = Number(req.params.id);
    const { codice_commessa, codice_ft, codice_rlom, descrizione, scadenza, cliente_id, stato } = req.body;
    try {
        const commessa = await prisma_1.prisma.commessa.update({
            where: { id },
            data: {
                codice_commessa,
                codice_ft,
                codice_rlom,
                descrizione,
                scadenza,
                cliente_id,
                stato
            },
            include: { cliente: true }
        });
        res.json(commessa);
    }
    catch (error) {
        console.error(error);
        res.status(500).json("Errore nella modifica della commessa");
    }
};
exports.updateCommessa = updateCommessa;
const deleteCommessa = async (req, res) => {
    const id = Number(req.params.id);
    try {
        await prisma_1.prisma.commessa.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json("Errore nell'eliminazione della commessa");
    }
};
exports.deleteCommessa = deleteCommessa;
