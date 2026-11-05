import { prisma } from "../prisma";
import express from "express";
import path from "path";
import { randomUUID } from "node:crypto";
import { createClient } from '@supabase/supabase-js'

import 'dotenv/config';
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

async function conUrl<T extends { storageKey: string; mimeType: string }>(m: T) {
  const { data, error } = await supabase.storage
    .from("Materiali")
    .createSignedUrl(m.storageKey, 3600);

  if (error) console.error("createSignedUrl fallito per", m.storageKey, error.message);

  return { ...m, url: data?.signedUrl ?? "" };
}

const getMateriali = async (req: express.Request, res: express.Response) => {
  try {
    const materiali = await prisma.materiale.findMany({     // se usi il cestino; altrimenti toglilo
      orderBy: { createdAt: "desc" },
    });

    if (materiali.length === 0) {
      return res.json([]);
    }

    const { data, error } = await supabase.storage
      .from("Materiali")
      .createSignedUrls(materiali.map((m) => m.storageKey), 3600);

    if (error) console.error("createSignedUrls fallito:", error.message);

    const urlPerPath = new Map(
      (data ?? []).map((d) => [d.path, d.signedUrl ?? ""])
    );

    const materialiConUrl = materiali.map((m) => ({
      ...m,
      url: urlPerPath.get(m.storageKey) ?? "",
    }));

    return res.json(materialiConUrl);
  } catch (err) {
    console.error("getMateriali:", err);
    return res.status(500).json({ error: "Errore nel recupero dei materiali" });
  }
}

const getMateriale = async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);

  try {
    const materiale = await prisma.materiale.findUnique({ where: { id } });
    const bucket = "Materiali";

    if (!materiale) {
      return res.status(404).json({ error: "Materiale non trovato" });
    }

    return res.json(await conUrl(materiale));
  } catch (error) {
    console.error("Errore nel recupero del materiale:", error);
    res.status(500).send("Errore del server");
  }
};

const getMaterialiMetadata = async (req: express.Request, res: express.Response) => {
  try {
    const materiali = await prisma.materiale.findMany({     // se usi il cestino; altrimenti toglilo
      orderBy: { createdAt: "desc" },
    });

    if (materiali.length === 0) {
      return res.json([]);
    }
    
    return res.json(materiali);
  } catch (err) {
    console.error("getMateriali:", err);
    return res.status(500).json({ error: "Errore nel recupero dei materiali" });
  }
}

const createMateriale = async (
  req: express.Request,
  res: express.Response
) => {
  const file = req.file;
  const { titolo, descrizione, categoria } = req.body;


  if (!file) {
    return res.status(400).json({ error: "File mancante" });
  }

  const bucket = "Materiali";
  const storageKey = `materiali/${new Date().getFullYear()}/${crypto.randomUUID()}`;
  let uploaded = false;

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storageKey, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;
    uploaded = true;
    const arrayBuffer = new Uint8Array(file.buffer).buffer;

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      arrayBuffer
    );

    const checksum = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    const materiale = await prisma.materiale.create({
      data: {
        titolo: titolo,
        originalName: file.originalname,
        categoria: categoria,
        mimeType: file.mimetype,
        checksum: checksum,
        sizeBytes: file.size,
        storageKey: storageKey,
        descrizione:
          typeof descrizione === "string"
            ? descrizione
            : undefined,
      },
    });

    return res.status(201).json(materiale);
  } catch (error) {
    if (uploaded) {
      const { error: cleanupError } = await supabase.storage
        .from(bucket)
        .remove([storageKey]);

      if (cleanupError) {
        console.error("Errore nella pulizia del file caricato:", cleanupError);
      }
    }

    console.error("Errore nel caricamento del materiale:", error);
    return res.status(500).json({ error: "Errore nel caricamento del materiale" });
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
    if (materiale.storageKey) {
      // Elimina il file fisico da Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('materiali-didattici')
        .remove([materiale.storageKey]); // .remove() accetta un array di nomi file

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
  getMaterialiMetadata,
  createMateriale,
  updateMateriale,
  deleteMateriale,
  getModuliByMateriale
};
