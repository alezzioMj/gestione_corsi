
import express from "express";
import { prisma } from "../prisma";
import { buildInclude, IncludeMap } from "./utility.ts/include";

class OwnershipError extends Error { }

const INCLUDE_MAP = {
    agente: true,
    sedi: { include: { contatti: true } },
    commesse: true
} satisfies IncludeMap;

const getClienti = async (req: express.Request, res: express.Response) => {
    try {
        const include = buildInclude(req, INCLUDE_MAP);

        const clienti = await prisma.cliente.findMany({
            orderBy: { id: "desc" },
            include
        })

        res.status(200).json(clienti);
    }
    catch (error) {
        console.error("Errore nel recupero dei clienti:", error);
        return res.status(500).json({
            error: "Errore durante il recupero dei clienti"
        });
    }
};

const createCliente = async (req: express.Request, res: express.Response) => {
    try {
        const { ragione_sociale, partita_iva, agente, sedi } = req.body;

        const cliente = await prisma.cliente.create({
            data: {
                ragione_sociale,
                partita_iva,
                // agente completo: con id = esistente (collega), senza id = nuovo (crea).
                // Campi elencati a mano: id e campi extra non passano.
                agente: !agente
                    ? undefined
                    : agente.id
                        ? { connect: { id: agente.id } }
                        : {
                            create: {
                                nome: agente.nome,
                                cognome: agente.cognome,
                                email: agente.email,
                                telefono: agente.telefono
                            }
                        },
                sedi: sedi ? {
                    create: sedi.map(({ id: _id, cliente_id: _cid, contatti, ...sede }: any) => ({
                        ...sede,
                        contatti: contatti ? {
                            create: contatti.map(({ id: _cid2, sede_id: _sid, ...contatto }: any) => contatto)
                        } : undefined
                    }))
                } : undefined
            },
            include: { sedi: { include: { contatti: true } }, agente: true }
        });

        return res.status(201).json(cliente);
    } catch (err: any) {
        console.error({ message: "Errore nella creazione del cliente", error: err });
        if (err.code === "P2002") {
            return res.status(409).json({ error: "Esiste già un cliente con questa partita IVA" });
        }
        return res.status(500).json({ error: "Errore creazione cliente" });
    }
};

const updateCliente = async (req: express.Request, res: express.Response) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ error: "Id non valido" });

        const { ragione_sociale, partita_iva, agente_id, sedi } = req.body;

        const result = await prisma.$transaction(async (px) => {
            const sediEsistenti: any[] = sedi?.filter((s: any) => s.id != null) ?? [];
            const sediNuove: any[] = sedi?.filter((s: any) => s.id == null) ?? [];
            const sediIds: number[] = sediEsistenti.map((s: any) => s.id);

            if (sediIds.length) {
                const n = await px.cliente_sede.count({
                    where: { id: { in: sediIds }, cliente_id: id },
                });
                if (n !== sediIds.length) throw new OwnershipError("Una o più sedi non appartengono al cliente");
            }

            for (const sede of sediEsistenti) {
                const contattiIds: number[] =
                    sede.contatti?.filter((c: any) => c.id != null).map((c: any) => c.id) ?? [];
                if (!contattiIds.length) continue;
                const n = await px.cliente_contatto.count({
                    where: { id: { in: contattiIds }, sede_id: sede.id },
                });
                if (n !== contattiIds.length) throw new OwnershipError("Uno o più contatti non appartengono alla sede");
            }

            return px.cliente.update({
                where: { id },
                data: {
                    ragione_sociale,
                    partita_iva,

                    agente:
                        agente_id === undefined ? undefined
                            : agente_id === null ? { disconnect: true }
                                : { connect: { id: agente_id } },

                    sedi: sedi
                        ? {
                            deleteMany: { id: { notIn: sediIds } },

                            update: sediEsistenti.map(
                                ({ id: sedeId, cliente_id: _cid, contatti, ...datiSede }: any) => {
                                    const esistenti = contatti?.filter((c: any) => c.id != null) ?? [];
                                    const nuovi = contatti?.filter((c: any) => c.id == null) ?? [];
                                    return {
                                        where: { id: sedeId },
                                        data: {
                                            ...datiSede,
                                            contatti: contatti
                                                ? {
                                                    deleteMany: { id: { notIn: esistenti.map((c: any) => c.id) } },
                                                    update: esistenti.map(({ id: cid, sede_id: _sid, ...dati }: any) => ({
                                                        where: { id: cid },
                                                        data: dati,
                                                    })),
                                                    create: nuovi.map(({ id: _id, sede_id: _sid, ...dati }: any) => dati),
                                                }
                                                : undefined,
                                        },
                                    };
                                }
                            ),

                            create: sediNuove.map(
                                ({ id: _id, cliente_id: _cid, contatti, ...datiSede }: any) => ({
                                    ...datiSede,
                                    contatti: contatti
                                        ? {
                                            create: contatti.map(({ id: _cid2, sede_id: _sid, ...dati }: any) => dati),
                                        }
                                        : undefined,
                                })
                            ),
                        }
                        : undefined,
                },
                include: { sedi: { include: { contatti: true } }, agente: true },
            });
        });

        return res.status(200).json(result);
    } catch (err: any) {
        console.error({ message: "Errore nell'aggiornamento del cliente", error: err });
        if (err instanceof OwnershipError) {
            return res.status(403).json({ error: err.message });
        }
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Cliente non trovato" });
        }
        if (err.code === "P2002") {
            return res.status(409).json({ error: "Esiste già un cliente con questa partita IVA" });
        }
        if (err.code === "P2003") {
            return res.status(400).json({ error: "L'agente selezionato non esiste" });
        }
        return res.status(500).json({ error: "Errore aggiornamento cliente" });
    }
}

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
