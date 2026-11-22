import { prisma } from "../prisma";
import express from "express";
import { Prisma } from "@prisma/client";
import { buildInclude, IncludeMap } from "./utility.ts/include";
import { toDate } from "./utility.ts/date";

const INCLUDE_MAP = {
  docente: true,
  sede: true,
  aula: true,
} satisfies IncludeMap;

const getIndisponibilita = async (req: express.Request, res: express.Response) => {
  try {
    const include = buildInclude(req, INCLUDE_MAP);

    const indisponibilita = await prisma.indisponibilita.findMany({
      orderBy: { data_inizio: "desc" },
      include,
    });
    res.json(indisponibilita);
  } catch (error) {
    console.error("Errore nel recupero delle indisponibilità:", error);
    res.status(500).send("Errore del server");
  }
};

const getIndisponibilitaById = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const include = buildInclude(req, INCLUDE_MAP);

    const indisponibilita = await prisma.indisponibilita.findUnique({
      where: { id },
      include,
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
      docente_cf,
      sede_id,
      aula_id,
      data_inizio,
      data_fine,
      ora_inizio,
      ora_fine,
      causale,
      descrizione,
    } = req.body;

    const indisponibilita = await prisma.indisponibilita.create({
      data: {
        docente_cf,
        sede_id,
        aula_id,
        data_inizio: toDate(data_inizio),
        data_fine: toDate(data_fine),
        ora_inizio,
        ora_fine,
        causale,
        descrizione,
      },
      include: buildInclude(req, INCLUDE_MAP),
    });

    res.status(201).json(indisponibilita);
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione dell'indisponibilità",
      error: err,
    });
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Il docente, la sede o l'aula selezionata non esiste" });
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Dati dell'indisponibilità non validi" });
    }
    res.status(500).json({ error: "Errore creazione indisponibilità" });
  }
};

const updateIndisponibilita = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const {
      docente_cf,
      sede_id,
      aula_id,
      data_inizio,
      data_fine,
      ora_inizio,
      ora_fine,
      causale,
      descrizione,
    } = req.body;

    const indisponibilita = await prisma.indisponibilita.update({
      where: { id },
      data: {
        docente_cf,
        sede_id,
        aula_id,
        data_inizio: toDate(data_inizio),
        data_fine: toDate(data_fine),
        ora_inizio,
        ora_fine,
        causale,
        descrizione,
      },
      include: buildInclude(req, INCLUDE_MAP),
    });

    res.json(indisponibilita);
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento dell'indisponibilità",
      error: err,
    });
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Indisponibilità non trovata" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Il docente, la sede o l'aula selezionata non esiste" });
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Dati dell'indisponibilità non validi" });
    }
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
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Indisponibilità non trovata" });
    }
    res.status(500).json({ error: "Errore cancellazione indisponibilità" });
  }
};

export {
  getIndisponibilita,
  getIndisponibilitaById,
  createIndisponibilita,
  updateIndisponibilita,
  deleteIndisponibilita,
};
