"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMaterialeToModulo = exports.getProgrammiByModulo = exports.deleteMaterialeFromModulo = exports.addMaterialeToModulo = exports.getMaterialeByModulo = exports.getDocentiByModulo = exports.deleteModulo = exports.updateModulo = exports.createModulo = exports.getModulo = exports.getModuli = void 0;
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
const include_1 = require("./utility.ts/include");
const storage_1 = require("./utility.ts/storage");
const INCLUDE_MAP = {
    docente_modulo: { include: { docente: true } },
    modulo_materiale: { include: { materiale: true } },
    programma_modulo: { include: { programma: true } },
};
const normalizza = (m) => ({
    ...m,
    n_ore: m.n_ore ?? 4,
    multiplo: m.multiplo ?? false,
});
const toBool = (v) => (v === undefined ? undefined : v === true || v === "true");
const toNumber = (v) => (v === undefined || v === null || v === "" ? undefined : Number(v));
const getModuli = async (req, res) => {
    try {
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const moduli = await prisma_1.prisma.modulo.findMany({
            include,
        });
        res.json(moduli.map(normalizza));
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
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const modulo = await prisma_1.prisma.modulo.findUnique({
            where: { id },
            include,
        });
        if (!modulo) {
            return res.status(404).send("Modulo non trovato");
        }
        res.json(normalizza(modulo));
    }
    catch (error) {
        console.error("Errore nel recupero del modulo:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getModulo = getModulo;
const createModulo = async (req, res) => {
    try {
        const { titolo, n_ore, competenza, descrizione, multiplo, created_by } = req.body;
        const modulo = await prisma_1.prisma.modulo.create({
            data: {
                titolo,
                n_ore: toNumber(n_ore), // se manca, vale il default del database (4)
                competenza,
                descrizione,
                multiplo: toBool(multiplo),
                created_by,
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP),
        });
        res.status(201).json(normalizza(modulo));
    }
    catch (err) {
        console.error({
            message: "Errore nella creazione del modulo",
            error: err,
        });
        if (err instanceof client_1.Prisma.PrismaClientValidationError) {
            return res.status(400).json({ error: "Dati del modulo non validi (titolo, competenza o ore)" });
        }
        res.status(500).json({ error: "Errore creazione modulo" });
    }
};
exports.createModulo = createModulo;
const updateModulo = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { titolo, n_ore, competenza, descrizione, multiplo } = req.body;
        // campi non inviati = undefined = non toccati
        const modulo = await prisma_1.prisma.modulo.update({
            where: { id },
            data: {
                titolo,
                n_ore: toNumber(n_ore),
                competenza,
                descrizione,
                multiplo: toBool(multiplo),
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP),
        });
        res.json(normalizza(modulo));
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento del modulo",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Modulo non trovato" });
        }
        if (err instanceof client_1.Prisma.PrismaClientValidationError) {
            return res.status(400).json({ error: "Dati del modulo non validi (titolo, competenza o ore)" });
        }
        res.status(500).json({ error: "Errore aggiornamento modulo" });
    }
};
exports.updateModulo = updateModulo;
// docente_modulo, modulo_materiale e programma_modulo sono in cascade:
// l'unica relazione che blocca la cancellazione è sessione (Restrict).
const deleteModulo = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.modulo.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione del modulo",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Modulo non trovato" });
        }
        if (err.code === "P2003") {
            return res.status(409).json({ error: "Impossibile eliminare il modulo: è usato in una o più sessioni" });
        }
        res.status(500).json({ error: "Errore cancellazione modulo" });
    }
};
exports.deleteModulo = deleteModulo;
const getDocentiByModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const docenti = await prisma_1.prisma.docente_modulo.findMany({
            where: { modulo_id },
            include: { docente: true },
        });
        res.json(docenti);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca dei docenti del modulo",
            error: err,
        });
        res.status(500).json({ error: "Errore ricerca docenti" });
    }
};
exports.getDocentiByModulo = getDocentiByModulo;
const getMaterialeByModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const materiali = await prisma_1.prisma.modulo_materiale.findMany({
            where: { modulo_id },
            include: { materiale: true },
        });
        res.json(materiali);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca del materiale del modulo",
            error: err,
        });
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
                modulo_id,
                materiale_id: Number(materiale_id),
            },
        });
        res.status(201).json(relazione);
    }
    catch (err) {
        console.error({
            message: "Errore nell'associazione del materiale al modulo",
            error: err,
        });
        if (err.code === "P2002") {
            return res.status(409).json({ error: "Il materiale è già associato al modulo" });
        }
        if (err.code === "P2003") {
            return res.status(400).json({ error: "Il modulo o il materiale non esiste" });
        }
        res.status(500).json({ error: "Errore associazione materiale" });
    }
};
exports.addMaterialeToModulo = addMaterialeToModulo;
const deleteMaterialeFromModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const materiale_id = Number(req.params.materiale_id);
        await prisma_1.prisma.modulo_materiale.delete({
            where: {
                modulo_id_materiale_id: { modulo_id, materiale_id },
            },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione del materiale dal modulo",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Materiale non associato a questo modulo" });
        }
        res.status(500).json({ error: "Errore cancellazione materiale" });
    }
};
exports.deleteMaterialeFromModulo = deleteMaterialeFromModulo;
const getProgrammiByModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const programmi = await prisma_1.prisma.programma_modulo.findMany({
            where: { modulo_id },
            include: { programma: true },
        });
        res.json(programmi);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca dei programmi del modulo",
            error: err,
        });
        res.status(500).json({ error: "Errore ricerca programmi" });
    }
};
exports.getProgrammiByModulo = getProgrammiByModulo;
// Carica un file e lo associa al modulo. Il record e la relazione sono creati in
// transazione (rollback automatico); se qualcosa fallisce dopo l'upload,
// rimuovo il file dallo storage.
const uploadMaterialeToModulo = async (req, res) => {
    const file = req.file;
    const { titolo, categoria, descrizione } = req.body;
    const modulo_id = Number(req.params.id);
    if (!file) {
        return res.status(400).json({ error: "File mancante" });
    }
    if (!titolo) {
        return res.status(400).json({ error: "Titolo mancante" });
    }
    let storageKey = null;
    try {
        const upload = await (0, storage_1.uploadMateriale)(file);
        storageKey = upload.storageKey;
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const materiale = await tx.materiale.create({
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
            const relazione = await tx.modulo_materiale.create({
                data: { modulo_id, materiale_id: materiale.id },
            });
            return { materiale, relazione };
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error({
            message: "Errore nel caricamento del materiale per il modulo",
            error: err,
        });
        if (storageKey)
            await (0, storage_1.removeMateriale)(storageKey);
        if (err.code === "P2003") {
            return res.status(400).json({ error: "Il modulo selezionato non esiste" });
        }
        if (err instanceof client_1.Prisma.PrismaClientValidationError) {
            return res.status(400).json({ error: "Dati del materiale non validi (categoria o campi mancanti)" });
        }
        res.status(500).json({ error: "Errore caricamento materiale" });
    }
};
exports.uploadMaterialeToModulo = uploadMaterialeToModulo;
