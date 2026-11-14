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
        const { ragione_sociale, partita_iva, sedi } = req.body;

        const result = await prisma.$transaction(async (px) => {
            const cliente = await px.cliente.create({
                data: {
                    ragione_sociale,
                    partita_iva,

                    sedi: {
                        create: sedi.map(({ contatti, ...sede }) => ({
                            ...sede,

                            contatti: {
                                create: contatti.map(({ id, sede_id, ...contatto }) => ({
                                    ...contatto
                                }))
                            }
                        }))
                    }
                },
                include: {
                    sedi: {
                        include: {
                            contatti: true
                        }
                    }
                }
            });

            return cliente;
        });

        return res.status(201).json(result);
    }
    catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Errore durante la creazione del cliente"
        });
    }
};

const updateCliente = async (req: express.Request, res: express.Response) => {
    try {
        const id = Number(req.params.id);
        const { ragione_sociale, partita_iva, sedi } = req.body;

        const result = await prisma.$transaction(async (px) => {

            const sediEsistenti = sedi
                .filter(s => s.id != null)
                .map(s => s.id!);

            const sediVerificate = await px.cliente_sede.findMany({
                where: {
                    id: { in: sediEsistenti },
                    cliente_id: id
                },
                select: { id: true }
            });

            if (sediVerificate.length !== sediEsistenti.length) {
                throw new Error("Una o più sedi non appartengono al cliente");
            }

            for (const sede of sedi.filter(s => s.id != null)) {
                const contattiEsistenti = sede.contatti
                    .filter(c => c.id != null)
                    .map(c => c.id!);

                const contattiVerificati = await px.cliente_contatto.findMany({
                    where: {
                        id: { in: contattiEsistenti },
                        sede_id: sede.id!
                    },
                    select: { id: true }
                });

                if (contattiVerificati.length !== contattiEsistenti.length) {
                    throw new Error("Uno o più contatti non appartengono alla sede");
                }
            }

            const cliente = await px.cliente.update({
                where: { id },
                data: {
                    ragione_sociale,
                    partita_iva,

                    sedi: {
                        deleteMany: {
                            id: {
                                notIn: sediEsistenti
                            }
                        },

                        update: sedi
                            .filter(s => s.id != null)
                            .map(({ id: sede_id, contatti, ...sede }) => ({
                                where: { id: sede_id! },
                                data: {
                                    ...sede,

                                    contatti: {
                                        deleteMany: {
                                            id: {
                                                notIn: contatti
                                                    .filter(c => c.id != null)
                                                    .map(c => c.id!)
                                            }
                                        },

                                        update: contatti
                                            .filter(c => c.id != null)
                                            .map(({ id: contatto_id, ...contatto }) => ({
                                                where: { id: contatto_id! },
                                                data: { ...contatto }
                                            })),

                                        create: contatti
                                            .filter(c => c.id == null)
                                            .map(({ id: _id, ...contatto }) => ({
                                                ...contatto
                                            }))
                                    }
                                }
                            })),

                        create: sedi
                            .filter(s => s.id == null)
                            .map(({ id: _id, contatti, ...sede }) => ({
                                ...sede,
                                contatti: {
                                    create: contatti.map(({ id: _id, ...contatto }) => ({
                                        ...contatto
                                    }))
                                }
                            }))
                    }
                },
                include: {
                    sedi: {
                        include: {
                            contatti: true
                        }
                    }
                }
            });

            return cliente;
        });

        return res.status(200).json(result);
    }
    catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Errore durante la modifica del cliente"
        });
    }
};


const deleteCliente = async (req: express.Request, red: express.Response) => {

}

export {
    createCliente,
    getClienti,
    updateCliente,
    deleteCliente
}