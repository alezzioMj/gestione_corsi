import express from "express";
import { prisma } from "../prisma";
import { SedeClienteWithRelations } from "@progetto/shared/validation/sedecliente.schema";
import { Contatto } from "@progetto/shared/validation/contatto.schema";
import { ClienteWithRelations, CreateCliente } from "@progetto/shared/validation/cliente.schema";
import { Prisma } from "@prisma/client";
class OwnershipError extends Error {}


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
                        create: sedi.map(({ contatti, ...sede }: SedeClienteWithRelations) => ({
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
  const id = Number(req.params.id);
  const { ragione_sociale, partita_iva, sedi }: CreateCliente = req.body;

  try {
    const result = await prisma.$transaction(async (px) => {
      const sediEsistenti = sedi.filter((s) => s.id != null);
      const sediIds = sediEsistenti.map((s) => s.id!);

      // le sedi inviate con id devono appartenere a questo cliente
      const sediVerificate = await px.cliente_sede.count({
        where: { id: { in: sediIds }, cliente_id: id },
      });
      if (sediVerificate !== sediIds.length) {
        throw new OwnershipError("Una o più sedi non appartengono al cliente");
      }

      // i contatti inviati con id devono appartenere alla sede indicata
      for (const sede of sediEsistenti) {
        const contattiIds = sede.contatti.filter((c) => c.id != null).map((c) => c.id!);
        if (contattiIds.length === 0) continue;

        const contattiVerificati = await px.cliente_contatto.count({
          where: { id: { in: contattiIds }, sede_id: sede.id! },
        });
        if (contattiVerificati !== contattiIds.length) {
          throw new OwnershipError("Uno o più contatti non appartengono alla sede");
        }
      }

      return px.cliente.update({
        where: { id },
        data: {
          ragione_sociale,
          partita_iva,

          sedi: {
            deleteMany: { id: { notIn: sediIds } },

            update: sediEsistenti.map(({ id: sedeId, contatti, ...datiSede }) => ({
              where: { id: sedeId! },
              data: {
                ...datiSede,
                contatti: {
                  deleteMany: {
                    id: { notIn: contatti.filter((c) => c.id != null).map((c) => c.id!) },
                  },
                  update: contatti
                    .filter((c) => c.id != null)
                    .map(({ id: contattoId, ...datiContatto }) => ({
                      where: { id: contattoId! },
                      data: datiContatto,
                    })),
                  create: contatti
                    .filter((c) => c.id == null)
                    .map(({ id: _id, ...datiContatto }) => datiContatto),
                },
              },
            })),

            create: sedi
              .filter((s) => s.id == null)
              .map(({ id: _id, contatti, ...datiSede }) => ({
                ...datiSede,
                contatti: {
                  create: contatti.map(({ id: _cid, ...datiContatto }) => datiContatto),
                },
              })),
          },
        },
        include: { sedi: { include: { contatti: true } } },
      });
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof OwnershipError) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return res.status(404).json({ error: "Cliente non trovato" });
      if (error.code === "P2002") return res.status(409).json({ error: "Partita IVA già esistente" });
    }
    console.error(error);
    return res.status(500).json({ error: "Errore durante la modifica del cliente" });
  }
};

const deleteCliente = async (req: express.Request, res: express.Response) => {
    try {
        const id = Number(req.params.id);

        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        commesse: true
                    }
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

        await prisma.cliente.delete({
            where: { id }
        });

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
}