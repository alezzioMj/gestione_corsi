"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCompleteModulo = exports.getProgrammiByModulo = exports.deleteMaterialeFromModulo = exports.addMaterialeToModulo = exports.getMaterialeByModulo = exports.getDocentiByModulo = exports.deleteModulo = exports.updateModulo = exports.createModulo = exports.getModulo = exports.getModuli = exports.supabase = void 0;
require("dotenv/config");
const prisma_1 = require("../prisma");
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const getModuli = async (req, res) => {
    try {
        const moduli = await prisma_1.prisma.modulo.findMany();
        // Mappatura esplicita per garantire che i campi siano sempre presenti
        const result = moduli.map((m) => ({
            id: m.id,
            titolo: m.titolo,
            n_ore: m.n_ore !== null ? m.n_ore : 4,
            competenza: m.competenza,
            multiplo: m.multiplo === true ? true : false
        }));
        res.json(result);
    }
    catch (error) {
        console.error("Errore nel recupero dei moduli:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getModuli = getModuli;
const getModulo = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const modulo = await prisma_1.prisma.modulo.findUnique({
            where: { id }
        });
        if (!modulo) {
            return res.status(404).send("Modulo non trovato");
        }
        res.json({
            id: modulo.id,
            titolo: modulo.titolo,
            n_ore: modulo.n_ore !== null ? modulo.n_ore : 4,
            competenza: modulo.competenza,
            multiplo: modulo.multiplo === true ? true : false
        });
    }
    catch (error) {
        console.error("Errore nel recupero del modulo:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getModulo = getModulo;
const createModulo = async (req, res) => {
    try {
        const { titolo, n_ore, competenza, multiplo, created_by } = req.body;
        const modulo = await prisma_1.prisma.modulo.create({
            data: {
                titolo,
                n_ore: n_ore ? Number(n_ore) : 4,
                competenza,
                multiplo: Boolean(multiplo === true || multiplo === "true"),
                created_by
            }
        });
        res.status(201).json(modulo);
    }
    catch (err) {
        console.error("Errore nella creazione del modulo:", err);
        if (err.code === "P2002") {
            return res.status(400).json({ error: "Il modulo esiste già" });
        }
        res.status(500).json({ error: "Errore creazione modulo", details: err.message });
    }
};
exports.createModulo = createModulo;
const updateModulo = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { titolo, n_ore, competenza, multiplo } = req.body;
        const modulo = await prisma_1.prisma.modulo.update({
            where: { id },
            data: {
                titolo,
                n_ore: n_ore ? Number(n_ore) : 4,
                competenza,
                multiplo: Boolean(multiplo === true || multiplo === "true")
            }
        });
        res.json(modulo);
    }
    catch (err) {
        console.error("Errore nell'aggiornamento del modulo:", err);
        res.status(500).json({ error: "Errore aggiornamento modulo", details: err.message });
    }
};
exports.updateModulo = updateModulo;
const deleteModulo = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.modulo.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error("Errore nella cancellazione del modulo:", err);
        res.status(500).json({ error: "Errore cancellazione modulo" });
    }
};
exports.deleteModulo = deleteModulo;
const getDocentiByModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const docenti = await prisma_1.prisma.docente_modulo.findMany({
            where: { modulo_id },
            include: { docente: true }
        });
        res.json(docenti);
    }
    catch (err) {
        console.error("Errore ricerca docenti:", err);
        res.status(500).json({ error: "Errore ricerca docenti" });
    }
};
exports.getDocentiByModulo = getDocentiByModulo;
const getMaterialeByModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const materiali = await prisma_1.prisma.modulo_materiale.findMany({
            where: { modulo_id },
            include: { materiale: true }
        });
        res.json(materiali);
    }
    catch (err) {
        console.error("Errore ricerca materiale:", err);
        res.status(500).json({ error: "Errore ricerca materiale" });
    }
};
exports.getMaterialeByModulo = getMaterialeByModulo;
const addMaterialeToModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const { materiale_id } = req.body;
        const relazione = await prisma_1.prisma.modulo_materiale.create({
            data: {
                modulo_id: Number(modulo_id),
                materiale_id: Number(materiale_id)
            }
        });
        res.status(201).json(relazione);
    }
    catch (err) {
        console.error("Errore assegnazione materiale al modulo:", err);
        res.status(500).json({ error: "Errore assegnazione materiale" });
    }
};
exports.addMaterialeToModulo = addMaterialeToModulo;
const deleteMaterialeFromModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const materiale_id = Number(req.params.materiale_id);
        const relazione = await prisma_1.prisma.modulo_materiale.delete({
            where: {
                modulo_id_materiale_id: {
                    modulo_id,
                    materiale_id,
                },
            },
        });
        res.status(200).json(relazione);
    }
    catch (err) {
        console.error("Errore cancellazione materiale dal modulo:", err);
        res.status(500).json({ error: "Errore cancellazione materiale" });
    }
};
exports.deleteMaterialeFromModulo = deleteMaterialeFromModulo;
const getProgrammiByModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const programmi = await prisma_1.prisma.programma_modulo.findMany({
            where: { modulo_id },
            include: { programma: true }
        });
        res.json(programmi);
    }
    catch (err) {
        console.error("Errore ricerca programmi:", err);
        res.status(500).json({ error: "Errore ricerca programmi" });
    }
};
exports.getProgrammiByModulo = getProgrammiByModulo;
const uploadCompleteModulo = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).send("File mancante.");
        const { titolo, n_ore, competenza, multiplo, descrizioneMateriale } = req.body;
        const file = req.file;
        const fileName = `${Date.now()}-${file.originalname}`;
        const { error: uploadError } = await exports.supabase.storage
            .from('Materiali')
            .upload(fileName, file.buffer, { contentType: file.mimetype });
        if (uploadError)
            throw uploadError;
        const { data: publicUrlData } = exports.supabase.storage
            .from('Materiali')
            .getPublicUrl(fileName);
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const nuovoModulo = await tx.modulo.create({
                data: {
                    titolo,
                    n_ore: n_ore ? Number(n_ore) : 4,
                    competenza,
                    multiplo: Boolean(multiplo === true || multiplo === "true")
                }
            });
            const nuovoMateriale = await tx.materiale.create({
                data: {
                    url: publicUrlData.publicUrl,
                    file_name: file.originalname,
                    tipo: file.mimetype,
                    descrizione: descrizioneMateriale || `Materiale per ${titolo}`
                }
            });
            await tx.modulo_materiale.create({
                data: {
                    modulo_id: nuovoModulo.id,
                    materiale_id: nuovoMateriale.id
                }
            });
            return nuovoModulo;
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Errore upload completo modulo:", err);
        res.status(500).json({ error: "Errore durante la creazione completa" });
    }
};
exports.uploadCompleteModulo = uploadCompleteModulo;
