import { prisma } from "../prisma";
import express from "express";


const getCorsi = async (req: express.Request, res: express.Response) => {
  try {
    const corsi = await prisma.corso.findMany();
    if (corsi.length === 0) {
      return res.status(404).send("Nessun corso trovato");
    }
    res.json(corsi);
  } catch (error) {
    console.error("Errore nel recupero dei corsi:", error);
    res.status(500).send("Errore del server");
  }
};

const getCorso = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const corso = await prisma.corso.findUnique({
      where: { id },
    });

    if (!corso) {
      return res.status(404).send("Corso non trovato");
    }

    res.json(corso);
  } catch (error) {
    console.error("Errore nel recupero del corso:", error);
    res.status(500).send("Errore del server");
  }
};

const createCorso = async (req: express.Request, res: express.Response) => {
  try {
    const {
      nome, // Nuovo campo
      cliente,
      programma_id,
      n_ore,
      inizio,
      fine,
      mattina_inizio,
      mattina_fine,
      pomeriggio_inizio,
      pomeriggio_fine
    } = req.body;

    const corso = await prisma.corso.create({
      data: {
        nome, // Includi il nome
        cliente,
        programma_id,
        n_ore,
        inizio,
        fine,
        mattina_inizio,
        mattina_fine,
        pomeriggio_inizio,
        pomeriggio_fine
      }
    });

    res.status(201).json(corso);
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione del corso",
      error: err,
    });
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Il corso esiste già" });
    }
    res.status(500).json({ error: "Errore creazione corso" });
  }
};

const updateCorso = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const {
      cliente,
      programma_id,
      n_ore,
      inizio,
      fine,
      mattina_inizio,
      mattina_fine,
      pomeriggio_inizio,
      pomeriggio_fine
    } = req.body;

    const corso = await prisma.corso.update({
      where: { id },
      data: {
        cliente,
        programma_id,
        n_ore,
        inizio,
        fine,
        mattina_inizio,
        mattina_fine,
        pomeriggio_inizio,
        pomeriggio_fine
      }
    });

    res.json(corso);
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento del corso",
      error: err,
    });
    res.status(500).json({ error: "Errore aggiornamento corso" });
  }
};

const deleteCorso = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.corso.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione del corso",
      error: err,
    });
    res.status(500).json({ error: "Errore cancellazione corso" });
  }
};

const getDocenti = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const docenti = await prisma.corso_docente.findMany({
      where: { corso_id: id },
      include: {
        docente: true
      }
    })

    if (docenti.length === 0) {
      return res.status(404).send("Nessun docente trovato per questo corso");
    }
    res.json(docenti)

  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca dei docenti",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca docenti" });
  }
}

const addDocenteToCorso = async (req: express.Request, res: express.Response) => {
  try {
    const corso_id = Number(req.params.id);
    const { docenti_cfs } = req.body as { docenti_cfs: string[] };

    if (!docenti_cfs || !Array.isArray(docenti_cfs)) {
      return res.status(400).json({ error: "Formato dati non valido. Previsto array docenti_cfs" });
    }

    const dataToCreate = docenti_cfs.map(cf => ({
      corso_id,
      docente_cf: cf,
      n_ore: 0, // Valore predefinito, può essere aggiornato in seguito
    }));

    const result = await prisma.corso_docente.createMany({
      data: dataToCreate,
      skipDuplicates: true,
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error("Errore assegnazione docenti al corso", err);
    res.status(500).json({ error: "Errore assegnazione docenti" });
  }
};

const deleteDocenteFromCorso = async (req: express.Request, res: express.Response) => {
  try {
    const corso_id = Number(req.params.id);
    const { docente_cf } = req.params as { docente_cf: string };

    const relazione = await prisma.corso_docente.delete({
      where: {
        corso_id_docente_cf: {
          corso_id,
          docente_cf,
        },
      },
    });
    res.status(201).json(relazione);
  } catch (err: any) {
    console.error("Errore cancellazione docente dal corso", err);
    res.status(500).json({ error: "Errore cancellazione docente" });
  }
};

const getSediByCorso = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const sedi = await prisma.corso_sede.findMany({
      where: { corso_id: id },
      include: {
        sede: true
      }
    })

    if (sedi.length === 0) {
      return res.status(404).send("Nessuna sede trovata per questo corso");
    }
    res.json(sedi)

  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca delle sedi per questo corso",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca sedi" });
  }
}

const addSedeToCorso = async (req: express.Request, res: express.Response) => {
  try {
    const corso_id = Number(req.params.id);
    const { sedi_names } = req.body as { sedi_names: string[] };

    if (!sedi_names || !Array.isArray(sedi_names)) {
      return res.status(400).json({ error: "Formato dati non valido. Previsto array sedi_names" });
    }

    // Risolviamo i nomi delle sedi in ID
    const sediTrovate = await prisma.sede.findMany({
      where: {
        nome: { in: sedi_names }
      },
      select: { id: true }
    });

    const dataToCreate = sediTrovate.map(s => ({
      corso_id,
      sede_id: s.id,
    }));

    const result = await prisma.corso_sede.createMany({
      data: dataToCreate,
      skipDuplicates: true,
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error("Errore assegnazione sedi al corso", err);
    res.status(500).json({ error: "Errore assegnazione sedi" });
  }
};

const deleteSedeFromCorso = async (req: express.Request, res: express.Response) => {
  try {
    const corso_id = Number(req.params.corso_id);
    const sede_id = Number(req.params.sede_id);

    const relazione = await prisma.corso_sede.delete({
      where: {
        corso_id_sede_id: {
          corso_id,
          sede_id,
        },
      },
    });

    return res.status(200).json(relazione);
  } catch (err: any) {
    console.error("Errore cancellazione sede dal corso", err);
    return res.status(500).json({ error: "Errore cancellazione sede" });
  }
};

export {
  getCorsi,
  getCorso,
  createCorso,
  updateCorso,
  deleteCorso,
  getDocenti,
  addDocenteToCorso,
  deleteDocenteFromCorso,
  getSediByCorso,
  addSedeToCorso,
  deleteSedeFromCorso
};
