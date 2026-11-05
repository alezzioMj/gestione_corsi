import { z } from "zod";

export const CATEGORIE_MATERIALE = ["SLIDE", "DISPENSA", "VIDEO", "ESERCIZI", "ALTRO"] as const;

export const MIME_CONSENTITI = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
] as const;

export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export function tipoDaMime(mime: string): "pdf" | "immagine" | "video" | "altro" {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "immagine";
  if (mime.startsWith("video/")) return "video";
  return "altro";
}

export const materialeInputSchema = z.object({
  titolo: z.string().trim().min(1, "Il titolo è obbligatorio").max(255, "Titolo troppo lungo"),
  descrizione: z.string().trim().max(2000, "Descrizione troppo lunga").optional(),
  categoria: z.enum(CATEGORIE_MATERIALE).default("ALTRO"),
});

export const fileUploadSchema = z.object({
  mimetype: z.enum(MIME_CONSENTITI, { error: "Tipo di file non consentito" }),
  size: z.number().max(MAX_FILE_BYTES, "File troppo grande"),
  originalname: z.string().min(1).max(255),
});

export const materialeSchema = z.object({
  id: z.uuid(),
  titolo: z.string(),
  descrizione: z.string().nullable(),
  categoria: z.enum(CATEGORIE_MATERIALE),
  originalName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  tipo: z.enum(["pdf", "immagine", "video", "altro"]),
  url: z.string(), // aggiunto dal backend (URL firmato o route interna)
  createdBy: z.string().nullable(),
  createdAt: z.iso.datetime(),
});

export type MaterialeInput = z.infer<typeof materialeInputSchema>;
export type Materiale = z.infer<typeof materialeSchema>;