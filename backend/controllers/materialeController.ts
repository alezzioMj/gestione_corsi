import { prisma } from "../prisma";
import express from "express";
import { Prisma, CategoriaMateriale } from "@prisma/client";
import { supabase, BUCKET_MATERIALI } from "./utility.ts/supabase";
import { uploadMateriale, removeMateriale } from "./utility.ts/storage";

const CATEGORIE = Object.values(CategoriaMateriale) as string[];

async function conUrl<T extends { storageKey: string }>(m: T) {
  const { data, error } = await supabase.storage
    .from(BUCKET_MATERIALI)
    .createSignedUrl(m.storageKey, 3600);

  if (error) console.error("createSignedUrl fallito per", m.storageKey, error.message);

  return { ...m, url: data?.signedUrl ?? "" };
}

const getMateriali = async (req: express.Request, res: express.Response) => {
  try {
    const materiali = await prisma.materiale.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (materiali.length === 0) {
      return res.json([]);
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_MATERIALI)
      .createSignedUrls(materiali.map((m) => m.storageKey), 3600);

    if (error) console.error("createSignedUrls fallito:", error.message);

    const urlPerPath = new Map(
      (data ?? []).map((d) => [d.path, d.signedUrl ?? ""])
    );

    res.json(
      materiali.map((m) => ({
        ...m,
        url: urlPerPath.get(m.storageKey) ?? "",
      }))
    );
  } catch (error) {
    console.error("Errore nel recupero dei materiali:", error);
    res.status(500).send("Errore del server");
  }
};

const getMaterialiMetadata = async (req: express.Request, res: express.Response) => {
  try {
    const materiali = await prisma.materiale.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(materiali);
  } catch (error) {
    console.error("Errore nel recupero dei metadati dei materiali:", error);
    res.status(500).send("Errore del server");
  }
};

const getMateriale = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);

    const materiale = await prisma.materiale.findUnique({ where: { id } });

    if (!materiale) {
      return res.status(404).send("Materiale non trovato");
    }

    res.json(await conUrl(materiale));
  } catch (error) {
    console.error("Errore nel recupero del materiale:", error);
    res.status(500).send("Errore del server");
  }
};

const createMateriale = async (req: express.Request, res: express.Response) => {
  const file = req.file;
  const { titolo, descrizione, categoria } = req.body;

  if (!file) {
    return res.status(400).json({ error: "File mancante" });
  }
  if (!titolo) {
    return res.status(400).json({ error: "Titolo mancante" });
  }
  if (categoria && !CATEGORIE.includes(categoria)) {
    return res.status(400).json({ error: `Categoria non valida. Valori ammessi: ${CATEGORIE.join(", ")}` });
  }

  let storageKey: string | null = null;

  try {
    const upload = await uploadMateriale(file);
    storageKey = upload.storageKey;

    const materiale = await prisma.materiale.create({
      data: {
        titolo,
        descrizione: typeof descrizione === "string" ? descrizione : undefined,
        categoria: categoria || undefined,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        checksum: upload.checksum,
        storageKey: upload.storageKey,
      },
    });

    res.status(201).json(materiale);
  } catch (err: any) {
    console.error({
      message: "Errore nel caricamento del materiale",
      error: err,
    });
    // se il file era già nello storage ma il record non è stato creato, lo rimuovo
    if (storageKey) await removeMateriale(storageKey);

    if (err instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Dati del materiale non validi" });
    }
    res.status(500).json({ error: "Errore nel caricamento del materiale" });
  }
};

const updateMateriale = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const { titolo, descrizione, categoria } = req.body;

    if (categoria && !CATEGORIE.includes(categoria)) {
      return res.status(400).json({ error: `Categoria non valida. Valori ammessi: ${CATEGORIE.join(", ")}` });
    }

    const materiale = await prisma.materiale.update({
      where: { id },
      data: {
        titolo,
        descrizione,
        categoria,
      },
    });

    res.json(materiale);
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento del materiale",
      error: err,
    });
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Materiale non trovato" });
    }
    res.status(500).json({ error: "Errore aggiornamento materiale" });
  }
};

// modulo_materiale è in cascade. Prima elimino il record, poi il file:
// se il database fallisce non resta un record senza file.
const deleteMateriale = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);

    const materiale = await prisma.materiale.delete({
      where: { id },
    });

    await removeMateriale(materiale.storageKey);

    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione del materiale",
      error: err,
    });
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Materiale non trovato" });
    }
    res.status(500).json({ error: "Errore cancellazione materiale" });
  }
};

const getModuliByMateriale = async (req: express.Request, res: express.Response) => {
  try {
    const materiale_id = Number(req.params.id);
    const moduli = await prisma.modulo_materiale.findMany({
      where: { materiale_id },
      include: { modulo: true },
    });

    res.json(moduli);
  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca dei moduli associati al materiale",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca moduli" });
  }
};

export {
  getMateriali,
  getMaterialiMetadata,
  getMateriale,
  createMateriale,
  updateMateriale,
  deleteMateriale,
  getModuliByMateriale,
};
