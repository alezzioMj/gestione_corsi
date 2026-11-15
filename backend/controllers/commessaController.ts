import express from 'express';
import { prisma } from '../prisma';

const getCommesse = async (req: express.Request, res: express.Response) => {
    try {
        const commesse = await prisma.commessa.findMany({
            orderBy: { scadenza: "asc" }
        })

        res.json(commesse);
    } catch (error) {
        console.error(error);
        res.status(500).json("Errore del server");
    }
}

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
            }
        })

        res.json(commessa);
    } catch (error) {
        console.error(error);
        res.status(500).json("Errore nella creazione della commessa");
    }
}