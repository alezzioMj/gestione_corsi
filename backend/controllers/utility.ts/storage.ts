import { createHash, randomUUID } from "node:crypto";
import { supabase, BUCKET_MATERIALI } from "./supabase";

// Carica il file nello storage e restituisce chiave e checksum.
// Se l'upload fallisce lancia l'errore (il file non è stato salvato).
export const uploadMateriale = async (file: Express.Multer.File) => {
  const storageKey = `materiali/${new Date().getFullYear()}/${randomUUID()}`;

  const { error } = await supabase.storage
    .from(BUCKET_MATERIALI)
    .upload(storageKey, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const checksum = createHash("sha256").update(file.buffer).digest("hex");
  return { storageKey, checksum };
};

// Rimozione "best effort": logga l'errore ma non lo rilancia.
export const removeMateriale = async (storageKey: string) => {
  const { error } = await supabase.storage
    .from(BUCKET_MATERIALI)
    .remove([storageKey]);

  if (error) {
    console.error("Errore nella rimozione del file dallo storage:", storageKey, error);
  }
};
