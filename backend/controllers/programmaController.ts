import { prisma } from "../prisma";
import express from "express";
import { buildInclude, IncludeMap } from "./utility.ts/include";

const INCLUDE_MAP = {
  programma_modulo: { include: { modulo: true }, orderBy: { ordine: "asc" } },
  corso: true,
} satisfies IncludeMap;

const getProgrammi = async (req: express.Request, res: express.Response) => {
  try {
    const include = buildInclude(req, INCLUDE_MAP);

    const programmi = await prisma.programma.findMany({
      include,
    });
    res.json(programmi);
  } catch (error) {
    console.error("Errore nel recupero dei programmi:", error);
    res.status(500).send("Errore del server");
  }
};

const getProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const include = buildInclude(req, INCLUDE_MAP);

    const programma = await prisma.programma.findUnique({
      where: { id },
      include,
    });

    if (!programma) {
      return res.status(404).send("Programma non trovato");
    }

    res.json(programma);
  } catch (error) {
    console.error("Errore nel recupero del programma:", error);
    res.status(500).send("Errore del server");
  }
};

const createProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const {
      titolo,
      descrizione,
      durata_totale,
      ore_pratiche,
      ore_teoriche,
      ore_trasversali,
    } = req.body;

    const programma = await prisma.programma.create({
      data: {
        titolo,
        descrizione,
        durata_totale,
        ore_pratiche,
        ore_teoriche,
        ore_trasversali,
      },
      include: buildInclude(req, INCLUDE_MAP),
    });

    res.status(201).json(programma);
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione del programma",
      error: err,
    });
    res.status(500).json({ error: "Errore creazione programma" });
  }
};

const updateProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const {
      titolo,
      descrizione,
      durata_totale,
      ore_pratiche,
      ore_teoriche,
      ore_trasversali,
    } = req.body;

    const programma = await prisma.programma.update({
      where: { id },
      data: {
        titolo,
        descrizione,
        durata_totale,
        ore_pratiche,
        ore_teoriche,
        ore_trasversali,
      },
      include: buildInclude(req, INCLUDE_MAP),
    });

    res.json(programma);
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento del programma",
      error: err,
    });
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Programma non trovato" });
    }
    res.status(500).json({ error: "Errore aggiornamento programma" });
  }
};

// programma_modulo è in cascade; corso.programma no (NoAction): se esistono corsi collegati, P2003.
const deleteProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.programma.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione del programma",
      error: err,
    });
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Programma non trovato" });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ error: "Impossibile eliminare il programma: è usato da uno o più corsi" });
    }
    res.status(500).json({ error: "Errore cancellazione programma" });
  }
};

const getModuliByProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const programma_id = Number(req.params.id);
    const moduli = await prisma.programma_modulo.findMany({
      where: { programma_id },
      include: { modulo: true },
      orderBy: { ordine: "asc" },
    });

    res.json(moduli);
  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca dei moduli per questo programma",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca moduli" });
  }
};

const addModuloToProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const programma_id = Number(req.params.id);
    const { modulo_id, obbligatorio } = req.body;

    // ordine massimo attuale + 1
    const maxOrdine = await prisma.programma_modulo.findFirst({
      where: { programma_id },
      orderBy: { ordine: "desc" },
      select: { ordine: true },
    });

    const relazione = await prisma.programma_modulo.create({
      data: {
        programma_id,
        modulo_id,
        obbligatorio: obbligatorio ?? true,
        ordine: (maxOrdine?.ordine ?? 0) + 1,
      },
      include: { modulo: true },
    });

    res.status(201).json(relazione);
  } catch (err: any) {
    console.error({
      message: "Errore nell'assegnazione del modulo al programma",
      error: err,
    });
    // @@unique([programma_id, ordine]): due richieste in parallelo possono calcolare lo stesso ordine
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Conflitto sull'ordine dei moduli, riprova" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Il programma o il modulo non esiste" });
    }
    res.status(500).json({ error: "Errore assegnazione modulo" });
  }
};

// Sostituisce l'intero elenco dei moduli del programma, nell'ordine ricevuto
const addModuloToProgrammaBulk = async (req: express.Request, res: express.Response) => {
  try {
    const programma_id = Number(req.params.id);
    const { moduli_ids } = req.body;

    if (!moduli_ids || !Array.isArray(moduli_ids)) {
      return res.status(400).json({ error: "Formato dati non valido. Previsto array moduli_ids" });
    }

    const result = await prisma.$transaction([
      prisma.programma_modulo.deleteMany({ where: { programma_id } }),
      prisma.programma_modulo.createMany({
        data: moduli_ids.map((id: number, index: number) => ({
          programma_id,
          modulo_id: id,
          ordine: index + 1,
        })),
      }),
    ]);

    res.status(201).json(result);
  } catch (err: any) {
    console.error({
      message: "Errore nell'assegnazione dei moduli al programma",
      error: err,
    });
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Il programma o uno dei moduli non esiste" });
    }
    res.status(500).json({ error: "Errore assegnazione moduli" });
  }
};

// Elimina e riordina nella stessa transazione. Spostare gli ordini in avanti
// (1, 3, 4 -> 1, 2, 3) non viola mai @@unique([programma_id, ordine]).
const deleteModuloFromProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const programma_id = Number(req.params.id);
    const programma_modulo_id = Number(req.params.programma_modulo_id);

    const eliminato = await prisma.$transaction(async (tx) => {
      const { count } = await tx.programma_modulo.deleteMany({
        where: { id: programma_modulo_id, programma_id },
      });
      if (count === 0) return false;

      const rimanenti = await tx.programma_modulo.findMany({
        where: { programma_id },
        orderBy: { ordine: "asc" },
      });

      for (const [index, m] of rimanenti.entries()) {
        if (m.ordine !== index + 1) {
          await tx.programma_modulo.update({
            where: { id: m.id },
            data: { ordine: index + 1 },
          });
        }
      }
      return true;
    });

    if (!eliminato) {
      return res.status(404).json({ error: "Modulo non presente in questo programma" });
    }

    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione del modulo dal programma",
      error: err,
    });
    res.status(500).json({ error: "Errore cancellazione modulo" });
  }
};

const createCompleteProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const {
      titolo,
      descrizione,
      durata_totale,
      ore_pratiche,
      ore_teoriche,
      ore_trasversali,
      moduli_ids, // id dei moduli nell'ordine desiderato
    } = req.body;

    if (!titolo || !Array.isArray(moduli_ids) || moduli_ids.length === 0) {
      return res.status(400).json({ error: "Titolo e almeno un modulo sono obbligatori" });
    }

    const programma = await prisma.programma.create({
      data: {
        titolo,
        descrizione,
        durata_totale: Number(durata_totale),
        ore_pratiche: Number(ore_pratiche),
        ore_teoriche: Number(ore_teoriche),
        ore_trasversali: Number(ore_trasversali),
        programma_modulo: {
          create: moduli_ids.map((modulo_id: number, index: number) => ({
            modulo_id,
            ordine: index + 1,
          })),
        },
      },
      include: { programma_modulo: { include: { modulo: true } } },
    });

    res.status(201).json(programma);
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione del programma completo",
      error: err,
    });
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Uno dei moduli selezionati non esiste" });
    }
    res.status(500).json({ error: "Errore creazione programma" });
  }
};

export {
  getProgrammi,
  getProgramma,
  createProgramma,
  updateProgramma,
  deleteProgramma,
  getModuliByProgramma,
  addModuloToProgramma,
  addModuloToProgrammaBulk,
  deleteModuloFromProgramma,
  createCompleteProgramma,
};
