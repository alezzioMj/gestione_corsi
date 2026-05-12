import { prisma } from "../prisma";
import express from "express";


const getProgrammi = async (req: express.Request, res: express.Response) => {
  try {
    const programmi = await prisma.programma.findMany({
      include: {
        programma_modulo: {
          include: {
            modulo: true
          }
        }
      }
    });
    if (programmi.length === 0) {
      return res.status(404).send("Nessun programma trovato");
    }
    res.json(programmi);
  } catch (error) {
    console.error("Errore nel recupero dei programmi:", error);
    res.status(500).send("Errore del server");
  }
};

const getProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const programma = await prisma.programma.findUnique({
      where: { id },
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
      ore_trasversali
    } = req.body;

    const programma = await prisma.programma.create({
      data: {
        titolo,
        descrizione,
        durata_totale,
        ore_pratiche,
        ore_teoriche,
        ore_trasversali
      }
    });

    res.status(201).json(programma);
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione del programma",
      error: err,
    });
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Il programma esiste già" });
    }
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
      ore_trasversali
    } = req.body;

    const programma = await prisma.programma.update({
      where: { id },
      data: {
        titolo,
        descrizione,
        durata_totale,
        ore_pratiche,
        ore_teoriche,
        ore_trasversali
      }
    });

    res.json(programma);
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento del programma",
      error: err,
    });
    res.status(500).json({ error: "Errore aggiornamento programma" });
  }
};

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
    res.status(500).json({ error: "Errore cancellazione programma" });
  }
};

const getModuliByProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const programma_id = Number(req.params.id);
    const moduli = await prisma.programma_modulo.findMany({
      where: { programma_id },
      include: {
        modulo: true
      }
    })

    if (moduli.length === 0) {
      return res.status(404).send("Nessun modulo trovato per questo programma");
    }
    res.json(moduli)

  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca dei moduli per questo programma",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca moduli" });
  }
}

const addModuloToProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const programma_id = Number(req.params.id);
    const { modulo_id, obbligatorio, ordine } = req.body;

    const relazione = await prisma.programma_modulo.create({
      data: {
        programma_id,
        modulo_id,
        obbligatorio,
        ordine
      },
    });

    res.status(201).json(relazione);
  } catch (err: any) {
    console.error("Errore assegnazione modulo al programma", err);
    res.status(500).json({ error: "Errore assegnazione modulo" });
  }
};

export const addModuloToProgrammaBulk = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const programma_id = Number(req.params.id);
    const { moduli_ids } = req.body;

    const relazione = await prisma.$transaction([
      prisma.programma_modulo.deleteMany({
        where: { programma_id },
      }),

      prisma.programma_modulo.createMany({
        data: moduli_ids.map((id: number, index: number) => ({
          programma_id,
          modulo_id: id,
          ordine: index + 1,
        })),
        skipDuplicates: true,
      }),
    ]);

    res.status(201).json(relazione);
  } catch (err: any) {
    console.error(
      "Errore assegnazione moduli al programma",
      err
    );

    res.status(500).json({
      error: "Errore assegnazione moduli",
    });
  }
};


const deleteModuloFromProgramma = async (req: express.Request, res: express.Response) => {
  try {
    const programma_id = Number(req.params.id);
    const modulo_id = Number(req.params.modulo_id);

    const relazione = await prisma.programma_modulo.delete({
      where: {
        programma_id_modulo_id: {
          programma_id,
          modulo_id,
        },
      },
    });

    return res.status(200).json(relazione);
  } catch (err: any) {
    console.error("Errore cancellazione modulo dal programma", err);
    return res.status(500).json({ error: "Errore cancellazione modulo" });
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
  deleteModuloFromProgramma
};
