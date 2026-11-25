"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMateriale = exports.uploadMateriale = void 0;
const node_crypto_1 = require("node:crypto");
const supabase_1 = require("./supabase");
// Carica il file nello storage e restituisce chiave e checksum.
// Se l'upload fallisce lancia l'errore (il file non è stato salvato).
const uploadMateriale = async (file) => {
    const storageKey = `materiali/${new Date().getFullYear()}/${(0, node_crypto_1.randomUUID)()}`;
    const { error } = await supabase_1.supabase.storage
        .from(supabase_1.BUCKET_MATERIALI)
        .upload(storageKey, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
    });
    if (error)
        throw error;
    const checksum = (0, node_crypto_1.createHash)("sha256").update(file.buffer).digest("hex");
    return { storageKey, checksum };
};
exports.uploadMateriale = uploadMateriale;
// Rimozione "best effort": logga l'errore ma non lo rilancia.
const removeMateriale = async (storageKey) => {
    const { error } = await supabase_1.supabase.storage
        .from(supabase_1.BUCKET_MATERIALI)
        .remove([storageKey]);
    if (error) {
        console.error("Errore nella rimozione del file dallo storage:", storageKey, error);
    }
};
exports.removeMateriale = removeMateriale;
