import { prisma } from "../prisma";
import express from "express";

const getAule = async (req: express.Request, res: express.Response) => {
  try {
    const aule = await prisma.aula.findMany();
    res.json(aule);
  } catch (error) {
    console.error("Errore nel recupero delle aule:", error);
    res.status(500).send("Errore del server");
  }
};

const getAula = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const aula = await prisma.aula.findUnique({
      where: { id },
    });

    if (!aula) {
      return res.status(404).send("Aula non trovata");
    }

    res.json(aula);
  } catch (error) {
    console.error("Errore nel recupero dell'aula:", error);
    res.status(500).send("Errore del server");
  }
};

const createAula = async (req: express.Request, res: express.Response) => {
  try {
    const {
      nome,
      sede_id,
      capienza,
      descrizione
    } = req.body;

    const aula = await prisma.aula.create({
      data: {
        nome,
        sede_id,
        capienza,
        descrizione
      }
    });

    res.status(201).json(aula);
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione dell'aula",
      error: err,
    });
    if (err.code === "P2002") {
      return res.status(400).json({ error: "L'aula esiste già" });
    }
    res.status(500).json({ error: "Errore creazione aula" });
  }
};

const updateAula = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const {
      nome,
      sede_id,
      capienza,
      descrizione
    } = req.body;

    const aula = await prisma.aula.update({
      where: { id },
      data: {
        nome,
        sede_id,
        capienza,
        descrizione
      }
    });

    res.json(aula);
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento dell'aula",
      error: err,
    });
    res.status(500).json({ error: "Errore aggiornamento aula" });
  }
};

const deleteAula = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.aula.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione dell'aula",
      error: err,
    });
    res.status(500).json({ error: "Errore cancellazione aula" });
  }
};

export { getAule, getAula, createAula, updateAula, deleteAula };
