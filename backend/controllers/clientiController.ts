
import express from "express";
import { prisma } from "../prisma";
import { z } from "zod";
import {
    ClienteWithRelations,
    ClienteUpdateSchema
} from "@progetto/shared/validation/types";

const createClienteSchema = ClienteWithRelations.omit({
    id: true,
    sedi: true
}).extend({
    sedi: z.array(
        ClienteWithRelations.shape.sedi.element.omit({
            id: true,
            cliente_id: true
        })
    )
});

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
        });

        return res.status(200).json(clienti);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Errore durante il recupero dei clienti"
        });
    }
};

const createCliente = async (req: express.Request, res: express.Response) => {
    try {
        const parsed = createClienteSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "Dati cliente non validi",
                details: parsed.error.flatten()
            });
        }

        const { ragione_sociale, partita_iva, agente_id, sedi } = parsed.data;

        const result = await prisma.$transaction(async (px) => {
            return px.cliente.create({
                data: {
                    ragione_sociale,
                    partita_iva,
                    agente_id,
                    sedi: {
                        create: sedi.map(({ contatti, ...sede }) => ({
                            ...sede,
                            contatti: {
                                create: contatti.map(({ ...contatto }) => ({
                                    ...contatto
                                }))
                            }
                        }))
                    }
                },
                include: {
                    sedi: {
                        include: { contatti: true }
                    }
                }
            });
        });

        return res.status(201).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Errore durante la creazione del cliente"
        });
    }
};

const updateCliente = async (req: express.Request, res: express.Response) => {
    try {
        const id = Number(req.params.id);
        const parsed = ClienteUpdateSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "Dati cliente non validi",
                details: parsed.error.flatten()
            });
        }

        const { ragione_sociale, partita_iva, sedi } = parsed.data;

        const result = await prisma.$transaction(async (px) => {
            const sediEsistenti = sedi
                .filter((s) => s.id != null)
                .map((s) => s.id!);

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

            for (const sede of sedi.filter((s) => s.id != null)) {
                const contattiEsistenti = sede.contatti
                    .filter((c) => c.id != null)
                    .map((c) => c.id!);

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

            return px.cliente.update({
                where: { id },
                data: {
                    ragione_sociale,
                    partita_iva,
                    sedi: {
                        deleteMany: {
                            id: { notIn: sediEsistenti }
                        },
                        update: sedi
                            .filter((s) => s.id != null)
                            .map(({ id: sede_id, contatti, ...sede }) => ({
                                where: { id: sede_id! },
                                data: {
                                    ...sede,
                                    contatti: {
                                        deleteMany: {
                                            id: {
                                                notIn: contatti
                                                    .filter((c) => c.id != null)
                                                    .map((c) => c.id!)
                                            }
                                        },
                                        update: contatti
                                            .filter((c) => c.id != null)
                                            .map(({ id: contatto_id, ...contatto }) => ({
                                                where: { id: contatto_id! },
                                                data: { ...contatto }
                                            })),
                                        create: contatti
                                            .filter((c) => c.id == null)
                                            .map(({ id: _id, ...contatto }) => ({
                                                ...contatto
                                            }))
                                    }
                                }
                            })),
                        create: sedi
                            .filter((s) => s.id == null)
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
                        include: { contatti: true }
                    }
                }
            });
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Errore durante la modifica del cliente"
        });
    }
};

const deleteCliente = async (req: express.Request, res: express.Response) => {
    try {
        const id = Number(req.params.id);

        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { commesse: true }
                }
            }
        });

        if (!cliente) {
            return res.status(404).json({
                message: "Cliente non trovato."
            });
        }

        if (cliente._count.commesse > 0) {
            return res.status(409).json({
                message: "Impossibile eliminare il cliente: è associato a una o più commesse."
            });
        }

        await prisma.cliente.delete({ where: { id } });

        return res.status(200).json({
            message: "Cliente eliminato correttamente."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Errore durante l'eliminazione del cliente."
        });
    }
};

export {
    createCliente,
    getClienti,
    updateCliente,
    deleteCliente
};
