import { prisma } from "../prisma";
import express from "express";

const getIndisponibilita = async (req: express.Request, res: express.Response) => {
  try {
    const indisponibilita = await prisma.indisponibilita.findMany();
    res.json(indisponibilita);
  } catch (error) {
    console.error("Errore nel recupero delle indisponibilità:", error);
    res.status(500).send("Errore del server");
  }
};

const getIndisponibilitaById = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);

    const indisponibilita = await prisma.indisponibilita.findUnique({
      where: { id },
    });

    if (!indisponibilita) {
      return res.status(404).send("Indisponibilità non trovata");
    }

    res.json(indisponibilita);
  } catch (error) {
    console.error("Errore nel recupero dell'indisponibilità:", error);
    res.status(500).send("Errore del server");
  }
};

const createIndisponibilita = async (req: express.Request, res: express.Response) => {
  try {
    const {
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
    } = req.body;

    const indisponibilita = await prisma.indisponibilita.create({
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
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione dell'indisponibilità",
      error: err,
    });

    res.status(500).json({ error: "Errore creazione indisponibilità" });
  }
};

const updateIndisponibilita = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);

    const {
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
    } = req.body;

    const indisponibilita = await prisma.indisponibilita.update({
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
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento dell'indisponibilità",
      error: err,
    });

    res.status(500).json({ error: "Errore aggiornamento indisponibilità" });
  }
};

const deleteIndisponibilita = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.indisponibilita.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione dell'indisponibilità",
      error: err,
    });

    res.status(500).json({ error: "Errore cancellazione indisponibilità" });
  }
};

export {
  getIndisponibilita,
  getIndisponibilitaById,
  createIndisponibilita,
  updateIndisponibilita,
  deleteIndisponibilita
};