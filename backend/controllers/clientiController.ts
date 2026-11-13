import express from "express";
import { prisma } from "../prisma";
import { Prisma, sede } from "@prisma/client";
import { Sede, SedeCliente } from "@progetto/shared/validation/types";

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

            const sedi = await px.cliente_sede.createMany({
                data: sedi.map(sede => ({
                    ...sede,
                    cliente_id: cliente.id,
                })),
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
    createCliente
}