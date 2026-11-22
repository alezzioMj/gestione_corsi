import { prisma } from "../prisma";
import express from "express";
import { buildInclude, IncludeMap } from "./utility.ts/include";

const INCLUDE_MAP = {
  aula: true,
  corso_sede: { include: { corso: true } },
} satisfies IncludeMap;

const getSedi = async (req: express.Request, res: express.Response) => {
  try {
    const include = buildInclude(req, INCLUDE_MAP);

    const sedi = await prisma.sede.findMany({
      include,
    });
    res.json(sedi);
  } catch (error) {
    console.error("Errore nel recupero delle sedi:", error);
    res.status(500).send("Errore del server");
  }
};

const getSede = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const include = buildInclude(req, INCLUDE_MAP);

    const sede = await prisma.sede.findUnique({
      where: { id },
      include,
    });

    if (!sede) {
      return res.status(404).send("Sede non trovata");
    }

    res.json(sede);
  } catch (error) {
    console.error("Errore nel recupero della sede:", error);
    res.status(500).send("Errore del server");
  }
};

const createSede = async (req: express.Request, res: express.Response) => {
  try {
    const {
      nome,
      indirizzo,
      civico,
      cap,
      citta,
      provincia,
      descrizione,
    } = req.body;

    const sede = await prisma.sede.create({
      data: {
        nome,
        indirizzo,
        civico,
        cap,
        citta,
        provincia,
        descrizione,
      },
      include: buildInclude(req, INCLUDE_MAP),
    });

    res.status(201).json(sede);
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione della sede",
      error: err,
    });
    // cap è Char(5) e provincia Char(2)
    if (err.code === "P2000") {
      return res.status(400).json({ error: "Valore troppo lungo (cap: 5 caratteri, provincia: 2)" });
    }
    res.status(500).json({ error: "Errore creazione sede" });
  }
};

const updateSede = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const {
      nome,
      indirizzo,
      civico,
      cap,
      citta,
      provincia,
      descrizione,
    } = req.body;

    const sede = await prisma.sede.update({
      where: { id },
      data: {
        nome,
        indirizzo,
        civico,
        cap,
        citta,
        provincia,
        descrizione,
      },
      include: buildInclude(req, INCLUDE_MAP),
    });

    res.json(sede);
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento della sede",
      error: err,
    });
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Sede non trovata" });
    }
    if (err.code === "P2000") {
      return res.status(400).json({ error: "Valore troppo lungo (cap: 5 caratteri, provincia: 2)" });
    }
    res.status(500).json({ error: "Errore aggiornamento sede" });
  }
};

// corso_sede è in cascade; aula, indisponibilita e sessione no: con righe collegate, P2003.
const deleteSede = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.sede.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione della sede",
      error: err,
    });
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Sede non trovata" });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ error: "Impossibile eliminare la sede: ha aule, indisponibilità o sessioni collegate" });
    }
    res.status(500).json({ error: "Errore cancellazione sede" });
  }
};

const getCorsiBySede = async (req: express.Request, res: express.Response) => {
  try {
    const sede_id = Number(req.params.id);

    const corsi = await prisma.corso_sede.findMany({
      where: { sede_id },
      include: { corso: true },
    });

    res.json(corsi);
  } catch (err: any) {
    console.error({
      message: "Errore nel recupero dei corsi per sede",
      error: err,
    });
    res.status(500).json({ error: "Errore recupero corsi sede" });
  }
};

const getAuleBySede = async (req: express.Request, res: express.Response) => {
  try {
    const sede_id = Number(req.params.id);

    const aule = await prisma.aula.findMany({
      where: { sede_id },
    });

    res.json(aule);
  } catch (err: any) {
    console.error({
      message: "Errore nel recupero delle aule per sede",
      error: err,
    });
    res.status(500).json({ error: "Errore recupero aule sede" });
  }
};

export {
  getSedi,
  getSede,
  createSede,
  updateSede,
  deleteSede,
  getCorsiBySede,
  getAuleBySede,
};
