import { z } from "zod";

export const CATEGORIE_MATERIALE = [
    "SLIDE",
    "DISPENSA",
    "VIDEO",
    "ESERCIZI",
    "ALTRO",
] as const;

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

// Metadati modificabili
export const materialeInputSchema = z.object({
    titolo: z.string().trim().min(1, "Il titolo è obbligatorio").max(255, "Titolo troppo lungo"),
    descrizione: z.string().trim().max(2000, "Descrizione troppo lunga").nullish(),
    categoria: z.enum(CATEGORIE_MATERIALE),
});

// Il default sta solo in create: nel partial() di update si riapplicherebbe (Zod 4)
export const createMaterialeSchema = materialeInputSchema.extend({
    categoria: z.enum(CATEGORIE_MATERIALE).default("ALTRO"),
});

// L'id arriva da req.params, non dal body
export const updateMaterialeSchema = materialeInputSchema.partial();

// Validazione file
export const fileUploadSchema = z.object({
    mimetype: z.enum(MIME_CONSENTITI, { error: "Tipo di file non consentito" }),
    size: z.number().max(MAX_FILE_BYTES, "File troppo grande"),
    originalname: z.string().min(1).max(255),
});

// Riga restituita dal backend (JSON: le date arrivano come stringhe ISO)
export const materialeSchema = z.object({
    id: z.number().int(),
    titolo: z.string(),
    descrizione: z.string().nullable(),
    categoria: z.enum(CATEGORIE_MATERIALE),
    originalName: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    checksum: z.string().nullable(),
    storageKey: z.string(),
    uploadedById: z.string().nullable(),
    createdAt: z.iso.datetime(),
});

// getMateriali e getMateriale aggiungono l'URL firmato; getMaterialiMetadata no
export const materialeWithUrlSchema = materialeSchema.extend({
    url: z.string(),
});

export type MaterialeInput = z.infer<typeof materialeInputSchema>;
export type CreateMateriale = z.infer<typeof createMaterialeSchema>;
export type UpdateMateriale = z.infer<typeof updateMaterialeSchema>;
export type Materiale = z.infer<typeof materialeSchema>;
export type MaterialeWithUrl = z.infer<typeof materialeWithUrlSchema>;
