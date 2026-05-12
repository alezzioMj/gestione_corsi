"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgrammiByModulo = exports.deleteMaterialeFromModulo = exports.addMaterialeToModulo = exports.getMaterialeByModulo = exports.getDocentiByModulo = exports.deleteModulo = exports.updateModulo = exports.createModulo = exports.getModulo = exports.getModuli = void 0;
const prisma_1 = require("../prisma");
const getModuli = async (req, res) => {
    try {
        const moduli = await prisma_1.prisma.modulo.findMany();
        if (moduli.length === 0) {
            return res.status(404).send("Nessun modulo trovato");
        }
        res.json(moduli);
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
            where: { id },
        });
        if (!modulo) {
            return res.status(404).send("Modulo non trovato");
        }
        res.json(modulo);
    }
    catch (error) {
        console.error("Errore nel recupero del modulo:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getModulo = getModulo;
const createModulo = async (req, res) => {
    try {
        const { titolo, n_ore, competenza } = req.body;
        const modulo = await prisma_1.prisma.modulo.create({
            data: {
                titolo,
                n_ore,
                competenza
            }
        });
        res.status(201).json(modulo);
    }
    catch (err) {
        console.error({
            message: "Errore nella creazione del modulo",
            error: err,
        });
        if (err.code === "P2002") {
            return res.status(400).json({ error: "Il modulo esiste già" });
        }
        res.status(500).json({ error: "Errore creazione modulo" });
    }
};
exports.createModulo = createModulo;
const updateModulo = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { titolo, n_ore, competenza } = req.body;
        const modulo = await prisma_1.prisma.modulo.update({
            where: { id },
            data: {
                titolo,
                n_ore,
                competenza
            }
        });
        res.json(modulo);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento del modulo",
            error: err,
        });
        res.status(500).json({ error: "Errore aggiornamento modulo" });
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
        console.error({
            message: "Errore nella cancellazione del modulo",
            error: err,
        });
        res.status(500).json({ error: "Errore cancellazione moduolo" });
    }
};
exports.deleteModulo = deleteModulo;
const getDocentiByModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const docenti = await prisma_1.prisma.docente_modulo.findMany({
            where: { modulo_id },
            include: {
                docente: true
            }
        });
        if (docenti.length === 0) {
            return res.status(404).send("Nessun docente trovato per questo modulo");
        }
        res.json(docenti);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca dei docenti per questo corso",
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
            where: {
                modulo_id
            },
            include: {
                materiale: true
            }
        });
        if (materiali.length === 0) {
            return res.status(404).send("Nessun materiale trovato per questo modulo");
        }
        res.json(materiali);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca del materiale per questo modulo",
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
                materiale_id
            }
        });
        res.status(201).json(relazione);
    }
    catch (err) {
        console.error("Errore assegnazione materiale al modulo", err);
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
        res.status(201).json(relazione);
    }
    catch (err) {
        console.error("Errore cancellazione materiale dal modulo", err);
        res.status(500).json({ error: "Errore cancellazione modulo" });
    }
};
exports.deleteMaterialeFromModulo = deleteMaterialeFromModulo;
const getProgrammiByModulo = async (req, res) => {
    try {
        const modulo_id = Number(req.params.id);
        const programmi = await prisma_1.prisma.programma_modulo.findMany({
            where: {
                modulo_id
            },
            include: {
                programma: true
            }
        });
        if (programmi.length === 0) {
            return res.status(404).send("Nessun programma trovato per questo modulo");
        }
        res.json(programmi);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca dei programmi per questo modulo",
            error: err,
        });
        res.status(500).json({ error: "Errore ricerca programmi" });
    }
};
exports.getProgrammiByModulo = getProgrammiByModulo;
