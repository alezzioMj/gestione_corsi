"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuliByMateriale = exports.deleteMateriale = exports.updateMateriale = exports.createMateriale = exports.getMateriale = exports.getMateriali = exports.supabase = void 0;
require("dotenv/config");
const prisma_1 = require("../prisma");
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usa la Service Role per bypassare le RLS nel backend
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const getMateriali = async (req, res) => {
    try {
        const materiali = await prisma_1.prisma.materiale.findMany();
        res.json(materiali);
    }
    catch (error) {
        console.error("Errore nel recupero dei materiali:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getMateriali = getMateriali;
const getMateriale = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const materiale = await prisma_1.prisma.materiale.findUnique({
            where: { id },
        });
        if (!materiale) {
            return res.status(404).send("Materiale non trovato");
        }
        res.json(materiale);
    }
    catch (error) {
        console.error("Errore nel recupero del materiale:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getMateriale = getMateriale;
const createMateriale = async (req, res) => {
    try {
        const { url, file_name, tipo, descrizione, } = req.body;
        const materiale = await prisma_1.prisma.materiale.create({
            data: {
                url,
                file_name,
                tipo,
                descrizione,
            }
        });
        res.status(201).json(materiale);
    }
    catch (err) {
        console.error({
            message: "Errore nella creazione del materiale",
            error: err,
        });
        if (err.code === "P2002") {
            return res.status(400).json({ error: "Il materiale esiste già" });
        }
        res.status(500).json({ error: "Errore creazione materiale" });
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
        // Estrarre il nome del file dall'URL
        const fileName = materiale.url.split('/').pop();
        if (fileName) {
            // Elimina il file fisico da Supabase Storage
            const { error: storageError } = await exports.supabase.storage
                .from('materiali-didattici')
                .remove([fileName]); // .remove() accetta un array di nomi file
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
