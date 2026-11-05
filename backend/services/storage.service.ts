import express from "express";
import { prisma } from "../prisma";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

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

    const materiale = await prisma.materiale.create({
      data: {
        titolo : titolo,
        originalName : file.originalname,
        categoria: categoria,
        mimeType: file.mimetype,
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