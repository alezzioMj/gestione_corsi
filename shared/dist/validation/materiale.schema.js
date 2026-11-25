"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.materialeWithUrlSchema = exports.materialeSchema = exports.fileUploadSchema = exports.updateMaterialeSchema = exports.createMaterialeSchema = exports.materialeInputSchema = exports.MAX_FILE_BYTES = exports.MIME_CONSENTITI = exports.CATEGORIE_MATERIALE = void 0;
exports.tipoDaMime = tipoDaMime;
const zod_1 = require("zod");
exports.CATEGORIE_MATERIALE = [
    "SLIDE",
    "DISPENSA",
    "VIDEO",
    "ESERCIZI",
    "ALTRO",
];
exports.MIME_CONSENTITI = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "video/mp4",
];
exports.MAX_FILE_BYTES = 50 * 1024 * 1024;
function tipoDaMime(mime) {
    if (mime === "application/pdf")
        return "pdf";
    if (mime.startsWith("image/"))
        return "immagine";
    if (mime.startsWith("video/"))
        return "video";
    return "altro";
}
// Metadati modificabili
exports.materialeInputSchema = zod_1.z.object({
    titolo: zod_1.z.string().trim().min(1, "Il titolo è obbligatorio").max(255, "Titolo troppo lungo"),
    descrizione: zod_1.z.string().trim().max(2000, "Descrizione troppo lunga").nullish(),
    categoria: zod_1.z.enum(exports.CATEGORIE_MATERIALE),
});
// Il default sta solo in create: nel partial() di update si riapplicherebbe (Zod 4)
exports.createMaterialeSchema = exports.materialeInputSchema.extend({
    categoria: zod_1.z.enum(exports.CATEGORIE_MATERIALE).default("ALTRO"),
});
exports.updateMaterialeSchema = exports.materialeInputSchema.partial();
exports.fileUploadSchema = zod_1.z.object({
    mimetype: zod_1.z.enum(exports.MIME_CONSENTITI, { error: "Tipo di file non consentito" }),
    size: zod_1.z.number().max(exports.MAX_FILE_BYTES, "File troppo grande"),
    originalname: zod_1.z.string().min(1).max(255),
});
exports.materialeSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    titolo: zod_1.z.string(),
    descrizione: zod_1.z.string().nullable(),
    categoria: zod_1.z.enum(exports.CATEGORIE_MATERIALE),
    originalName: zod_1.z.string(),
    mimeType: zod_1.z.string(),
    sizeBytes: zod_1.z.number(),
    checksum: zod_1.z.string().nullable(),
    storageKey: zod_1.z.string(),
    uploadedById: zod_1.z.string().nullable(),
    createdAt: zod_1.z.iso.datetime(),
});
// getMateriali e getMateriale aggiungono l'URL firmato; getMaterialiMetadata no
exports.materialeWithUrlSchema = exports.materialeSchema.extend({
    url: zod_1.z.string(),
});
