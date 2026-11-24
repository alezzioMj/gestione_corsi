import { prisma } from "../prisma";
import express from "express";
import { Prisma } from "@prisma/client";
import { buildInclude, IncludeMap } from "./utility.ts/include";
import { uploadMateriale, removeMateriale } from "./utility.ts/storage";

const INCLUDE_MAP = {
  docente_modulo: { include: { docente: true } },
  modulo_materiale: { include: { materiale: true } },
  programma_modulo: { include: { programma: true } },
} satisfies IncludeMap;

const normalizza = <T extends { n_ore: number | null; multiplo: boolean | null }>(m: T) => ({
  ...m,
  n_ore: m.n_ore ?? 4,
  multiplo: m.multiplo ?? false,
});

const toBool = (v: any) => (v === undefined ? undefined : v === true || v === "true");
const toNumber = (v: any) => (v === undefined || v === null || v === "" ? undefined : Number(v));

const getModuli = async (req: express.Request, res: express.Response) => {
  try {
    const include = buildInclude(req, INCLUDE_MAP);

    const moduli = await prisma.modulo.findMany({
      include,
    });

    res.json(moduli.map(normalizza));
  } catch (error) {
    console.error("Errore nel recupero dei moduli:", error);
    res.status(500).send("Errore del server");
  }
};

const getModulo = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const include = buildInclude(req, INCLUDE_MAP);

    const modulo = await prisma.modulo.findUnique({
      where: { id },
      include,
    });

    if (!modulo) {
      return res.status(404).send("Modulo non trovato");
    }

    res.json(normalizza(modulo));
  } catch (error) {
    console.error("Errore nel recupero del modulo:", error);
    res.status(500).send("Errore del server");
  }
};

const createModulo = async (req: express.Request, res: express.Response) => {
  try {
    const { titolo, n_ore, competenza, descrizione, multiplo, created_by } = req.body;

    const modulo = await prisma.modulo.create({
      data: {
        titolo,
        n_ore: toNumber(n_ore), // se manca, vale il default del database (4)
        competenza,
        descrizione,
        multiplo: toBool(multiplo),
        created_by,
      },
      include: buildInclude(req, INCLUDE_MAP),
    });

    res.status(201).json(normalizza(modulo));
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione del modulo",
      error: err,
    });
    if (err instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Dati del modulo non validi (titolo, competenza o ore)" });
    }
    res.status(500).json({ error: "Errore creazione modulo" });
  }
};

const updateModulo = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const { titolo, n_ore, competenza, descrizione, multiplo } = req.body;

    // campi non inviati = undefined = non toccati
    const modulo = await prisma.modulo.update({
      where: { id },
      data: {
        titolo,
        n_ore: toNumber(n_ore),
        competenza,
        descrizione,
        multiplo: toBool(multiplo),
      },
      include: buildInclude(req, INCLUDE_MAP),
    });

    res.json(normalizza(modulo));
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento del modulo",
      error: err,
    });
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Modulo non trovato" });
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Dati del modulo non validi (titolo, competenza o ore)" });
    }
    res.status(500).json({ error: "Errore aggiornamento modulo" });
  }
};

// docente_modulo, modulo_materiale e programma_modulo sono in cascade:
// l'unica relazione che blocca la cancellazione è sessione (Restrict).
const deleteModulo = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.modulo.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione del modulo",
      error: err,
    });
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Modulo non trovato" });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ error: "Impossibile eliminare il modulo: è usato in una o più sessioni" });
    }
    res.status(500).json({ error: "Errore cancellazione modulo" });
  }
};

const getDocentiByModulo = async (req: express.Request, res: express.Response) => {
  try {
    const modulo_id = Number(req.params.id);
    const docenti = await prisma.docente_modulo.findMany({
      where: { modulo_id },
      include: { docente: true },
    });

    res.json(docenti);
  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca dei docenti del modulo",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca docenti" });
  }
};

const getMaterialeByModulo = async (req: express.Request, res: express.Response) => {
  try {
    const modulo_id = Number(req.params.id);
    const materiali = await prisma.modulo_materiale.findMany({
      where: { modulo_id },
      include: { materiale: true },
    });

    res.json(materiali);
  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca del materiale del modulo",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca materiale" });
  }
};

const addMaterialeToModulo = async (req: express.Request, res: express.Response) => {
  try {
    const modulo_id = Number(req.params.id);
    const { materiale_id } = req.body;

    const relazione = await prisma.modulo_materiale.create({
      data: {
        modulo_id,
        materiale_id: Number(materiale_id),
      },
    });

    res.status(201).json(relazione);
  } catch (err: any) {
    console.error({
      message: "Errore nell'associazione del materiale al modulo",
      error: err,
    });
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Il materiale è già associato al modulo" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Il modulo o il materiale non esiste" });
    }
    res.status(500).json({ error: "Errore associazione materiale" });
  }
};

const deleteMaterialeFromModulo = async (req: express.Request, res: express.Response) => {
  try {
    const modulo_id = Number(req.params.id);
    const materiale_id = Number(req.params.materiale_id);

    await prisma.modulo_materiale.delete({
      where: {
        modulo_id_materiale_id: { modulo_id, materiale_id },
      },
    });

    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione del materiale dal modulo",
      error: err,
    });
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Materiale non associato a questo modulo" });
    }
    res.status(500).json({ error: "Errore cancellazione materiale" });
  }
};

const getProgrammiByModulo = async (req: express.Request, res: express.Response) => {
  try {
    const modulo_id = Number(req.params.id);
    const programmi = await prisma.programma_modulo.findMany({
      where: { modulo_id },
      include: { programma: true },
    });

    res.json(programmi);
  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca dei programmi del modulo",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca programmi" });
  }
};

// Carica un file e lo associa al modulo. Il record e la relazione sono creati in
// transazione (rollback automatico); se qualcosa fallisce dopo l'upload,
// rimuovo il file dallo storage.
const uploadMaterialeToModulo = async (req: express.Request, res: express.Response) => {
  const file = req.file;
  const { titolo, categoria, descrizione } = req.body;
  const modulo_id = Number(req.params.id);

  if (!file) {
    return res.status(400).json({ error: "File mancante" });
  }
  if (!titolo) {
    return res.status(400).json({ error: "Titolo mancante" });
  }

  let storageKey: string | null = null;

  try {
    const upload = await uploadMateriale(file);
    storageKey = upload.storageKey;

    const result = await prisma.$transaction(async (tx) => {
      const materiale = await tx.materiale.create({
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

      const relazione = await tx.modulo_materiale.create({
        data: { modulo_id, materiale_id: materiale.id },
      });

      return { materiale, relazione };
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error({
      message: "Errore nel caricamento del materiale per il modulo",
      error: err,
    });
    if (storageKey) await removeMateriale(storageKey);

    if (err.code === "P2003") {
      return res.status(400).json({ error: "Il modulo selezionato non esiste" });
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Dati del materiale non validi (categoria o campi mancanti)" });
    }
    res.status(500).json({ error: "Errore caricamento materiale" });
  }
};

export {
  getModuli,
  getModulo,
  createModulo,
  updateModulo,
  deleteModulo,
  getDocentiByModulo,
  getMaterialeByModulo,
  addMaterialeToModulo,
  deleteMaterialeFromModulo,
  getProgrammiByModulo,
  uploadMaterialeToModulo,
};
