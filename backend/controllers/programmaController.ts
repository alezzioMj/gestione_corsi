import { prisma } from "../prisma";
import express from "express";


const getProgrammi = async (req: express.Request, res: express.Response) => {
  try {
    const programmi = await prisma.programma.findMany({
      include: {
        programma_modulo: {
          include: {
            modulo: true
          },
          orderBy: {
            ordine: 'asc'
          }
        }
      }
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
    const programma = await prisma.programma.findUnique({
      where: { id },
      include: {
        programma_modulo: {
          include: {
            modulo: true
          },
          orderBy: {
            ordine: 'asc'
          }
        }
      }
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
    } = req.body;

    const programma = await prisma.programma.update({
      where: { id },
      data: {
        titolo,
        descrizione
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
      },
      orderBy: {
        ordine: 'asc'
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
    const { modulo_id, obbligatorio } = req.body;

    // Trova l'ordine massimo attuale e aggiungi 1
    const maxOrdine = await prisma.programma_modulo.findFirst({
      where: { programma_id },
      orderBy: { ordine: 'desc' },
      select: { ordine: true }
    });

    const nuovoOrdine = (maxOrdine?.ordine || 0) + 1;

    const relazione = await prisma.programma_modulo.create({
      data: {
        programma_id,
        modulo_id,
        obbligatorio: obbligatorio ?? true,
        ordine: nuovoOrdine
      },
      include: {
        modulo: true
      }
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
    const programma_modulo_id = Number(req.params.programma_modulo_id);
    
    // Elimina usando l'ID della relazione
    const relazione = await prisma.programma_modulo.delete({
      where: {
        id: programma_modulo_id,
      },
    });

    // Riordinare gli ordini rimanenti
    const moduliRimanenti = await prisma.programma_modulo.findMany({
      where: { programma_id },
      orderBy: { ordine: 'asc' }
    });

    await prisma.$transaction(
      moduliRimanenti.map((m, index) =>
        prisma.programma_modulo.update({
          where: { id: m.id },
          data: { ordine: index + 1 }
        })
      )
    );

    return res.status(200).json(relazione);
  } catch (err: any) {
    console.error("Errore cancellazione modulo dal programma", err);
    return res.status(500).json({ error: "Errore cancellazione modulo" });
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
      moduli_ids, // Array of module IDs in desired order
    } = req.body;

    if (!titolo || !moduli_ids || moduli_ids.length === 0) {
      return res.status(400).json({ error: "Titolo e almeno un modulo sono obbligatori." });
    }

      
    const newProgramma = await prisma.programma.create({
      data: {
        titolo,
        descrizione,
        durata_totale: Number(durata_totale),
        ore_pratiche: Number(ore_pratiche),
        ore_teoriche: Number(ore_teoriche),
        ore_trasversali: Number(ore_trasversali),
        programma_modulo: {
          create: moduli_ids.map((moduloId: number, index: number) => ({
            modulo_id: moduloId,
            ordine: index + 1, // Assign order based on array index
          })),
        },
      },
      include: {
        programma_modulo: {
          include: {
            modulo: true
          }
        }
      },
    });

    res.status(201).json(newProgramma);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Un programma con questo titolo esiste già." });
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
  deleteModuloFromProgramma,
  createCompleteProgramma
};
