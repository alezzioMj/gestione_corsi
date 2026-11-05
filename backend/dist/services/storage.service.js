"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const prisma_1 = require("../prisma");
const node_crypto_1 = require("node:crypto");
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const createMateriale = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: "File mancante" });
    }
    const bucket = "Materiali"; // Usa lo stesso bucket in upload e cancellazione
    const storageFileName = (0, node_crypto_1.randomUUID)();
    let uploaded = false;
    try {
        const { error: uploadError } = await exports.supabase.storage
            .from(bucket)
            .upload(storageFileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (uploadError)
            throw uploadError;
        uploaded = true;
        const { data } = exports.supabase.storage
            .from(bucket)
            .getPublicUrl(storageFileName);
        const materiale = await prisma_1.prisma.materiale.create({
            data: {
                url: data.publicUrl,
                file_name: file.originalname,
                tipo: file.mimetype,
                descrizione: typeof req.body.descrizione === "string"
                    ? req.body.descrizione
                    : undefined,
            },
        });
        return res.status(201).json(materiale);
    }
    catch (error) {
        if (uploaded) {
            const { error: cleanupError } = await exports.supabase.storage
                .from(bucket)
                .remove([storageFileName]);
            if (cleanupError) {
                console.error("Errore nella pulizia del file caricato:", cleanupError);
            }
        }
        console.error("Errore nel caricamento del materiale:", error);
        return res.status(500).json({ error: "Errore nel caricamento del materiale" });
    }
};
