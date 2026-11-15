import express from 'express';
import { prisma } from '../prisma';

const getCommesse = async (req: express.Request, res: express.Response) => {
    try {
        const commesse = await prisma.commessa.findMany({
            orderBy: { scadenza: "asc" },
            include: { cliente: true }
        });

        res.json(commesse);
    } catch (error) {
        console.error(error);
        res.status(500).json("Errore del server");
    }
};

const createCommessa = async (req: express.Request, res: express.Response) => {
    const {
        codice_commessa,
        codice_ft,
        codice_rlom,
        descrizione,
        scadenza,
        cliente_id,
        stato
    } = req.body;

    try {
        const commessa = await prisma.commessa.create({
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
    } catch (error) {
        console.error(error);
        res.status(500).json("Errore nella creazione della commessa");
    }
};

const updateCommessa = async (req: express.Request, res: express.Response) => {
    const id = Number(req.params.id);

    const {
        codice_commessa,
        codice_ft,
        codice_rlom,
        descrizione,
        scadenza,
        cliente_id,
        stato
    } = req.body;

    try {
        const commessa = await prisma.commessa.update({
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
    } catch (error) {
        console.error(error);
        res.status(500).json("Errore nella modifica della commessa");
    }
};

const deleteCommessa = async (req: express.Request, res: express.Response) => {
    const id = Number(req.params.id);

    try {
        await prisma.commessa.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json("Errore nell'eliminazione della commessa");
    }
};

export {
    getCommesse,
    createCommessa,
    updateCommessa,
    deleteCommessa
};