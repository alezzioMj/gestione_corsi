import { z } from "zod";
export declare const CATEGORIE_MATERIALE: readonly ["SLIDE", "DISPENSA", "VIDEO", "ESERCIZI", "ALTRO"];
export declare const MIME_CONSENTITI: readonly ["application/pdf", "image/png", "image/jpeg", "image/webp", "video/mp4"];
export declare const MAX_FILE_BYTES: number;
export declare function tipoDaMime(mime: string): "pdf" | "immagine" | "video" | "altro";
export declare const materialeInputSchema: z.ZodObject<{
    titolo: z.ZodString;
    descrizione: z.ZodOptional<z.ZodString>;
    categoria: z.ZodDefault<z.ZodEnum<{
        SLIDE: "SLIDE";
        DISPENSA: "DISPENSA";
        VIDEO: "VIDEO";
        ESERCIZI: "ESERCIZI";
        ALTRO: "ALTRO";
    }>>;
}, z.core.$strip>;
export declare const fileUploadSchema: z.ZodObject<{
    mimetype: z.ZodEnum<{
        "application/pdf": "application/pdf";
        "image/png": "image/png";
        "image/jpeg": "image/jpeg";
        "image/webp": "image/webp";
        "video/mp4": "video/mp4";
    }>;
    size: z.ZodNumber;
    originalname: z.ZodString;
}, z.core.$strip>;
export declare const materialeSchema: z.ZodObject<{
    id: z.ZodUUID;
    titolo: z.ZodString;
    descrizione: z.ZodNullable<z.ZodString>;
    categoria: z.ZodEnum<{
        SLIDE: "SLIDE";
        DISPENSA: "DISPENSA";
        VIDEO: "VIDEO";
        ESERCIZI: "ESERCIZI";
        ALTRO: "ALTRO";
    }>;
    originalName: z.ZodString;
    mimeType: z.ZodString;
    sizeBytes: z.ZodNumber;
    checksum: z.ZodString;
    tipo: z.ZodEnum<{
        pdf: "pdf";
        immagine: "immagine";
        video: "video";
        altro: "altro";
    }>;
    url: z.ZodString;
    createdBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodISODateTime;
}, z.core.$strip>;
export type MaterialeInput = z.infer<typeof materialeInputSchema>;
export type Materiale = z.infer<typeof materialeSchema>;
