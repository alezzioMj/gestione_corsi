"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuliByMateriale = exports.deleteMateriale = exports.updateMateriale = exports.createMateriale = exports.getMateriale = exports.getMateriali = exports.supabase = void 0;
const prisma_1 = require("../prisma");
const supabase_js_1 = require("@supabase/supabase-js");
require("dotenv/config");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
async function conUrl(m) {
    const { data, error } = await exports.supabase.storage
        .from("Materiali")
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
        // una sola chiamata per tutti i file
        const { data, error } = await exports.supabase.storage
            .from("Materiali")
            .createSignedUrls(materiali.map((m) => m.storageKey), 3600);
        if (error)
            console.error("createSignedUrls fallito:", error.message);
        // associa per path, non per posizione
        const urlPerPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl ?? ""]));
        const materialiConUrl = materiali.map((m) => ({
            ...m,
            url: urlPerPath.get(m.storageKey) ?? "",
        }));
        return res.json(materialiConUrl);
    }
    catch (err) {
        console.error("getMateriali:", err);
        return res.status(500).json({ error: "Errore nel recupero dei materiali" });
    }
};
exports.getMateriali = getMateriali;
const getMateriale = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const materiale = await prisma_1.prisma.materiale.findUnique({ where: { id } });
        const bucket = "Materiali";
        if (!materiale) {
            return res.status(404).json({ error: "Materiale non trovato" });
        }
        return res.json(await conUrl(materiale));
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
    const bucket = "Materiali";
    const storageKey = `materiali/${new Date().getFullYear()}/${crypto.randomUUID()}`;
    let uploaded = false;
    try {
        const { error: uploadError } = await exports.supabase.storage
            .from(bucket)
            .upload(storageKey, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (uploadError)
            throw uploadError;
        uploaded = true;
        const materiale = await prisma_1.prisma.materiale.create({
            data: {
                titolo: titolo,
                originalName: file.originalname,
                categoria: categoria,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                storageKey: storageKey,
                descrizione: typeof descrizione === "string"
                    ? descrizione
                    : undefined,
            },
        });
        return res.status(201).json(materiale);
    }
    catch (error) {
        if (uploaded) {
            const { error: cleanupError } = await exports.supabase.storage
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
exports.createMateriale = createMateriale;
const updateMateriale = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { url, file_name, tipo, descrizione, } = req.body;
        const materiale = await prisma_1.prisma.materiale.update({
            where: { id },
            data: {
                url,
                file_name,
                tipo,
                descrizione,
            }
        });
        res.json(materiale);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento del materiale",
            error: err,
        });
        res.status(500).json({ error: "Errore aggiornamento materiale" });
    }
};
exports.updateMateriale = updateMateriale;
const deleteMateriale = async (req, res) => {
    try {
        const id = Number(req.params.id);
        // Recupero dati del materiale prima di cancellarlo
        const materiale = await prisma_1.prisma.materiale.findUnique({
            where: { id },
        });
        if (!materiale) {
            return res.status(404).json({ error: "Materiale non trovato" });
        }
        if (materiale.storageKey) {
            // Elimina il file fisico da Supabase Storage
            const { error: storageError } = await exports.supabase.storage
                .from('materiali-didattici')
                .remove([materiale.storageKey]); // .remove() accetta un array di nomi file
            if (storageError) {
                console.error("Errore eliminazione file da Supabase:", storageError);
            }
        }
        await prisma_1.prisma.materiale.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error("Errore nella cancellazione completa:", err);
        res.status(500).json({ error: "Errore durante l'eliminazione" });
    }
};
exports.deleteMateriale = deleteMateriale;
const getModuliByMateriale = async (req, res) => {
    try {
        const materiale_id = Number(req.params.id);
        const moduli = await prisma_1.prisma.modulo_materiale.findMany({
            where: {
                materiale_id
            },
            include: {
                modulo: true
            }
        });
        if (moduli.length === 0) {
            return res.status(404).send("Nessun modulo trovato per questo materiale");
        }
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
