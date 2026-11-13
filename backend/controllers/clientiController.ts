import express from "express";
import { prisma } from "../prisma";
import { cliente_sede, Prisma, sede } from "@prisma/client";
import { Sede, SedeCliente } from "@progetto/shared/validation/types";

const getClienti = async (req: express.Request, res: express.Response) => {
    try {
        const clienti = await prisma.cliente.findMany({
            orderBy: { id: "desc" },
            include: {
                agente: true,
                sedi: {
                    include: { contatti: true }
                }
            }
        })

        res.status(200).json(clienti);
    }
    catch (error) {
        return res.status(500).json({
            error: "Errore durante il recupero dei clienti"
        });
    }
}

const createCliente = async (req: express.Request, res: express.Response) => {
    try {
        const { ragione_sociale, partita_iva, sede_legale } = req.body;
        const { sedi } = req.body;

        const result = await prisma.$transaction(async (px) => {
            const cliente = await px.cliente.create({
                data: {
                    ragione_sociale: ragione_sociale,
                    partita_iva: partita_iva
                }
            })

            const resultSedi = await px.cliente_sede.createMany({
                data: sedi.map(({ contatti, ...sede }) => ({
                    ...sede,
                    cliente_id: cliente.id
                }))
            })

            return { cliente, sedi }
        })

        res.status(201).json(result);
    }
    catch (error) {
        return res.status(500).json({
            error: "Errore durante la creazione del cliente"
        });
    }
}

export {
    createCliente,
    getClienti
}