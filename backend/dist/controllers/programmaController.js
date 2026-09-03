"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompleteProgramma = exports.deleteModuloFromProgramma = exports.addModuloToProgramma = exports.getModuliByProgramma = exports.deleteProgramma = exports.updateProgramma = exports.createProgramma = exports.getProgramma = exports.getProgrammi = exports.addModuloToProgrammaBulk = void 0;
const prisma_1 = require("../prisma");
const getProgrammi = async (req, res) => {
    try {
        const programmi = await prisma_1.prisma.programma.findMany({
            include: {
                programma_modulo: {
                    include: {
                        modulo: true
                    },
                    orderBy: {
                        ordine: 'asc'
                    }
                }
            }
        });
        res.json(programmi);
    }
    catch (error) {
        console.error("Errore nel recupero dei programmi:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getProgrammi = getProgrammi;
const getProgramma = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const programma = await prisma_1.prisma.programma.findUnique({
            where: { id },
            include: {
                programma_modulo: {
                    include: {
                        modulo: true
                    },
                    orderBy: {
                        ordine: 'asc'
                    }
                }
            }
        });
        if (!programma) {
            return res.status(404).send("Programma non trovato");
        }
        res.json(programma);
    }
    catch (error) {
        console.error("Errore nel recupero del programma:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getProgramma = getProgramma;
const createProgramma = async (req, res) => {
    try {
        const { titolo, descrizione, durata_totale, ore_pratiche, ore_teoriche, ore_trasversali } = req.body;
        const programma = await prisma_1.prisma.programma.create({
            data: {
                titolo,
                descrizione,
                durata_totale,
                ore_pratiche,
                ore_teoriche,
                ore_trasversali
            }
        });
        res.status(201).json(programma);
    }
    catch (err) {
        console.error({
            message: "Errore nella creazione del programma",
            error: err,
        });
        if (err.code === "P2002") {
            return res.status(400).json({ error: "Il programma esiste già" });
        }
        res.status(500).json({ error: "Errore creazione programma" });
    }
};
exports.createProgramma = createProgramma;
const updateProgramma = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { titolo, descrizione, durata_totale, ore_pratiche, ore_teoriche, ore_trasversali } = req.body;
        const programma = await prisma_1.prisma.programma.update({
            where: { id },
            data: {
                titolo,
                descrizione,
                durata_totale,
                ore_pratiche,
                ore_teoriche,
                ore_trasversali
            }
        });
        res.json(programma);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento del programma",
            error: err,
        });
        res.status(500).json({ error: "Errore aggiornamento programma" });
    }
};
exports.updateProgramma = updateProgramma;
const deleteProgramma = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.programma.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione del programma",
            error: err,
        });
        res.status(500).json({ error: "Errore cancellazione programma" });
    }
};
exports.deleteProgramma = deleteProgramma;
const getModuliByProgramma = async (req, res) => {
    try {
        const programma_id = Number(req.params.id);
        const moduli = await prisma_1.prisma.programma_modulo.findMany({
            where: { programma_id },
            include: {
                modulo: true
            },
            orderBy: {
                ordine: 'asc'
            }
        });
        if (moduli.length === 0) {
            return res.status(404).send("Nessun modulo trovato per questo programma");
        }
        res.json(moduli);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca dei moduli per questo programma",
            error: err,
        });
        res.status(500).json({ error: "Errore ricerca moduli" });
    }
};
exports.getModuliByProgramma = getModuliByProgramma;
const addModuloToProgramma = async (req, res) => {
    try {
        const programma_id = Number(req.params.id);
        const { modulo_id, obbligatorio } = req.body;
        // Trova l'ordine massimo attuale e aggiungi 1
        const maxOrdine = await prisma_1.prisma.programma_modulo.findFirst({
            where: { programma_id },
            orderBy: { ordine: 'desc' },
            select: { ordine: true }
        });
        const nuovoOrdine = (maxOrdine?.ordine || 0) + 1;
        const relazione = await prisma_1.prisma.programma_modulo.create({
            data: {
                programma_id,
                modulo_id,
                obbligatorio: obbligatorio ?? true,
                ordine: nuovoOrdine
            },
            include: {
                modulo: true
            }
        });
        res.status(201).json(relazione);
    }
    catch (err) {
        console.error("Errore assegnazione modulo al programma", err);
        res.status(500).json({ error: "Errore assegnazione modulo" });
    }
};
exports.addModuloToProgramma = addModuloToProgramma;
const addModuloToProgrammaBulk = async (req, res) => {
    try {
        const programma_id = Number(req.params.id);
        const { moduli_ids } = req.body;
        const relazione = await prisma_1.prisma.$transaction([
            prisma_1.prisma.programma_modulo.deleteMany({
                where: { programma_id },
            }),
            prisma_1.prisma.programma_modulo.createMany({
                data: moduli_ids.map((id, index) => ({
                    programma_id,
                    modulo_id: id,
                    ordine: index + 1,
                })),
                skipDuplicates: true,
            }),
        ]);
        res.status(201).json(relazione);
    }
    catch (err) {
        console.error("Errore assegnazione moduli al programma", err);
        res.status(500).json({
            error: "Errore assegnazione moduli",
        });
    }
};
exports.addModuloToProgrammaBulk = addModuloToProgrammaBulk;
const deleteModuloFromProgramma = async (req, res) => {
    try {
        const programma_id = Number(req.params.id);
        const programma_modulo_id = Number(req.params.programma_modulo_id);
        // Elimina usando l'ID della relazione
        const relazione = await prisma_1.prisma.programma_modulo.delete({
            where: {
                id: programma_modulo_id,
            },
        });
        // Riordinare gli ordini rimanenti
        const moduliRimanenti = await prisma_1.prisma.programma_modulo.findMany({
            where: { programma_id },
            orderBy: { ordine: 'asc' }
        });
        await prisma_1.prisma.$transaction(moduliRimanenti.map((m, index) => prisma_1.prisma.programma_modulo.update({
            where: { id: m.id },
            data: { ordine: index + 1 }
        })));
        return res.status(200).json(relazione);
    }
    catch (err) {
        console.error("Errore cancellazione modulo dal programma", err);
        return res.status(500).json({ error: "Errore cancellazione modulo" });
    }
};
exports.deleteModuloFromProgramma = deleteModuloFromProgramma;
const createCompleteProgramma = async (req, res) => {
    try {
        const { titolo, descrizione, durata_totale, ore_pratiche, ore_teoriche, ore_trasversali, moduli_ids, // Array of module IDs in desired order
         } = req.body;
        if (!titolo || !moduli_ids || moduli_ids.length === 0) {
            return res.status(400).json({ error: "Titolo e almeno un modulo sono obbligatori." });
        }
        const newProgramma = await prisma_1.prisma.programma.create({
            data: {
                titolo,
                descrizione,
                durata_totale: Number(durata_totale),
                ore_pratiche: Number(ore_pratiche),
                ore_teoriche: Number(ore_teoriche),
                ore_trasversali: Number(ore_trasversali),
                programma_modulo: {
                    create: moduli_ids.map((moduloId, index) => ({
                        modulo_id: moduloId,
                        ordine: index + 1, // Assign order based on array index
                    })),
                },
            },
            include: {
                programma_modulo: {
                    include: {
                        modulo: true
                    }
                }
            },
        });
        res.status(201).json(newProgramma);
    }
    catch (err) {
        if (err.code === "P2002") {
            return res.status(400).json({ error: "Un programma con questo titolo esiste già." });
        }
        res.status(500).json({ error: "Errore creazione programma" });
    }
};
exports.createCompleteProgramma = createCompleteProgramma;
