import 'dotenv/config';
import { prisma } from "../prisma";
import express from "express";
import path from "path";
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Usa la Service Role per bypassare le RLS nel backend
export const supabase = createClient(supabaseUrl, supabaseKey)

const getMateriali = async (req: express.Request, res: express.Response) => {
  try {
    const materiali = await prisma.materiale.findMany();
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

    // Recupero dati del materiale prima di cancellarlo
    const materiale = await prisma.materiale.findUnique({
      where: { id },
    });

    if (!materiale) {
      return res.status(404).json({ error: "Materiale non trovato" });
    }

    // Estrarre il nome del file dall'URL
    const fileName = materiale.url.split('/').pop();

    if (fileName) {
      // Elimina il file fisico da Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('materiali-didattici')
        .remove([fileName]); // .remove() accetta un array di nomi file

      if (storageError) {
        console.error("Errore eliminazione file da Supabase:", storageError);
      }
    }
    await prisma.materiale.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err: any) {
    console.error("Errore nella cancellazione completa:", err);
    res.status(500).json({ error: "Errore durante l'eliminazione" });
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

export {
  getMateriali,
  getMateriale,
  createMateriale,
  updateMateriale,
  deleteMateriale,
  getModuliByMateriale // Export the new function
};
