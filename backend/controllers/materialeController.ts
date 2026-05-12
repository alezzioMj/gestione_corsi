import { prisma } from "../prisma";
import express from "express";
import path from "path";

const getMateriali = async (req: express.Request, res: express.Response) => {
  try {
    const materiali = await prisma.materiale.findMany();
    if (materiali.length === 0) {
      return res.status(404).send("Nessun materiale trovato");
    }
    res.json(materiali);
  } catch (error) {
    console.error("Errore nel recupero dei materiali:", error);
    res.status(500).send("Errore del server");
  }
};

const getMateriale = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const materiale = await prisma.materiale.findUnique({
      where: { id },
    });

    if (!materiale) {
      return res.status(404).send("Materiale non trovato");
    }

    res.json(materiale);
  } catch (error) {
    console.error("Errore nel recupero del materiale:", error);
    res.status(500).send("Errore del server");
  }
};

const createMateriale = async (req: express.Request, res: express.Response) => {
  try {
    const {
      url,
      file_name,
      tipo,
      descrizione,
    } = req.body;

    const materiale = await prisma.materiale.create({
      data: {
        url,
        file_name,
        tipo,
        descrizione,
      }
    });

    res.status(201).json(materiale);
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione del materiale",
      error: err,
    });
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Il materiale esiste già" });
    }
    res.status(500).json({ error: "Errore creazione materiale" });
  }
};

const updateMateriale = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const {
      url,
      file_name,
      tipo,
      descrizione,
    } = req.body;

    const materiale = await prisma.materiale.update({
      where: { id },
      data: {
        url,
        file_name,
        tipo,
        descrizione,
      }
    });

    res.json(materiale);
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento del materiale",
      error: err,
    });
    res.status(500).json({ error: "Errore aggiornamento materiale" });
  }
};

const deleteMateriale = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.materiale.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione del materiale",
      error: err,
    });
    res.status(500).json({ error: "Errore cancellazione materiale" });
  }
};

const getModuliByMateriale = async (req: express.Request, res: express.Response) => {
  try {
    const materiale_id = Number(req.params.id);
    const moduli = await prisma.modulo_materiale.findMany({
      where: {
        materiale_id
      },
      include: {
        modulo: true
      }
    })

    if (moduli.length === 0) {
      return res.status(404).send("Nessun modulo trovato per questo materiale");
    }
    res.json(moduli);
  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca dei moduli associati al materiale",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca moduli" });
  }
}

const uploadFileAndCreateMateriale = async (req: express.Request, res: express.Response) => {
  try {
    if (!req.file) {
      return res.status(400).send("Nessun file caricato.");
    }

    const { originalname, mimetype, filename, path: filePath } = req.file;
    const { descrizione } = req.body; // Optional description from form fields

    const materiale = await prisma.materiale.create({
      data: {
        url: `/uploads/${filename}`, // Store a relative path or URL
        file_name: originalname,
        tipo: mimetype || 'application/octet-stream', // Use mimetype from multer
        descrizione: descrizione || '', // Use provided description or empty string
      }
    });

    res.status(201).json(materiale);
  } catch (err: any) {
    console.error({
      message: "Errore nel caricamento del file e creazione del materiale",
      error: err,
    });
    res.status(500).json({ error: "Errore caricamento file" });
  }
};

export {
  getMateriali,
  getMateriale,
  createMateriale,
  updateMateriale,
  deleteMateriale,
  getModuliByMateriale,
  uploadFileAndCreateMateriale, // Export the new function
};
