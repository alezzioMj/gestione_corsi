"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuliByMateriale = exports.deleteMateriale = exports.updateMateriale = exports.createMateriale = exports.getMateriale = exports.getMaterialiMetadata = exports.getMateriali = void 0;
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
const supabase_1 = require("./utility.ts/supabase");
const storage_1 = require("./utility.ts/storage");
const CATEGORIE = Object.values(client_1.CategoriaMateriale);
async function conUrl(m) {
    const { data, error } = await supabase_1.supabase.storage
        .from(supabase_1.BUCKET_MATERIALI)
        .createSignedUrl(m.storageKey, 3600);
    if (error)
        console.error("createSignedUrl fallito per", m.storageKey, error.message);
    return { ...m, url: data?.signedUrl ?? "" };
}
const getMateriali = async (req, res) => {
    try {
        const materiali = await prisma_1.prisma.materiale.findMany({
            orderBy: { createdAt: "desc" },
        });
        if (materiali.length === 0) {
            return res.json([]);
        }
        const { data, error } = await supabase_1.supabase.storage
            .from(supabase_1.BUCKET_MATERIALI)
            .createSignedUrls(materiali.map((m) => m.storageKey), 3600);
        if (error)
            console.error("createSignedUrls fallito:", error.message);
        const urlPerPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl ?? ""]));
        res.json(materiali.map((m) => ({
            ...m,
            url: urlPerPath.get(m.storageKey) ?? "",
        })));
    }
    catch (error) {
        console.error("Errore nel recupero dei materiali:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getMateriali = getMateriali;
const getMaterialiMetadata = async (req, res) => {
    try {
        const materiali = await prisma_1.prisma.materiale.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(materiali);
    }
    catch (error) {
        console.error("Errore nel recupero dei metadati dei materiali:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getMaterialiMetadata = getMaterialiMetadata;
const getMateriale = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const materiale = await prisma_1.prisma.materiale.findUnique({ where: { id } });
        if (!materiale) {
            return res.status(404).send("Materiale non trovato");
        }
        res.json(await conUrl(materiale));
    }
    catch (error) {
        console.error("Errore nel recupero del materiale:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getMateriale = getMateriale;
const createMateriale = async (req, res) => {
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
    let storageKey = null;
    try {
        const upload = await (0, storage_1.uploadMateriale)(file);
        storageKey = upload.storageKey;
        const materiale = await prisma_1.prisma.materiale.create({
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
    }
    catch (err) {
        console.error({
            message: "Errore nel caricamento del materiale",
            error: err,
        });
        // se il file era già nello storage ma il record non è stato creato, lo rimuovo
        if (storageKey)
            await (0, storage_1.removeMateriale)(storageKey);
        if (err instanceof client_1.Prisma.PrismaClientValidationError) {
            return res.status(400).json({ error: "Dati del materiale non validi" });
        }
        res.status(500).json({ error: "Errore nel caricamento del materiale" });
    }
};
exports.createMateriale = createMateriale;
const updateMateriale = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { titolo, descrizione, categoria } = req.body;
        if (categoria && !CATEGORIE.includes(categoria)) {
            return res.status(400).json({ error: `Categoria non valida. Valori ammessi: ${CATEGORIE.join(", ")}` });
        }
        const materiale = await prisma_1.prisma.materiale.update({
            where: { id },
            data: {
                titolo,
                descrizione,
                categoria,
            },
        });
        res.json(materiale);
    }
    catch (err) {
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
exports.updateMateriale = updateMateriale;
// modulo_materiale è in cascade. Prima elimino il record, poi il file:
// se il database fallisce non resta un record senza file.
const deleteMateriale = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const materiale = await prisma_1.prisma.materiale.delete({
            where: { id },
        });
        await (0, storage_1.removeMateriale)(materiale.storageKey);
        res.status(204).send();
    }
    catch (err) {
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
exports.deleteMateriale = deleteMateriale;
const getModuliByMateriale = async (req, res) => {
    try {
        const materiale_id = Number(req.params.id);
        const moduli = await prisma_1.prisma.modulo_materiale.findMany({
            where: { materiale_id },
            include: { modulo: true },
        });
        res.json(moduli);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca dei moduli associati al materiale",
            error: err,
        });
        res.status(500).json({ error: "Errore ricerca moduli" });
    }
};
exports.getModuliByMateriale = getModuliByMateriale;
