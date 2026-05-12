"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteModuloFromDocente = exports.addModuliToDocenteBulk = exports.addModuloToDocente = exports.getModuliByDocente = exports.getCorsiByDocente = exports.deleteDocente = exports.updateDocente = exports.createDocente = exports.getDocente = exports.getDocenti = void 0;
const prisma_1 = require("../prisma");
const getDocenti = async (req, res) => {
    try {
        const docenti = await prisma_1.prisma.docente.findMany({
            include: {
                docente_modulo: {
                    include: {
                        modulo: true
                    }
                }
            }
        });
        if (docenti.length === 0) {
            return res.status(404).send("Nessun docente trovato");
        }
        res.json(docenti);
    }
    catch (error) {
        console.error("Errore nel recupero dei docenti:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getDocenti = getDocenti;
const getDocente = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        // Trova il docente usando Prisma
        const docente = await prisma_1.prisma.docente.findUnique({
            where: { codice_fiscale },
        });
        // Se il docente non viene trovato ritorna un 404
        if (!docente) {
            return res.status(404).send("Docente non trovato");
        }
        // Restituisci i dati del docente
        res.json(docente);
    }
    catch (error) {
        // Gestione errori Prisma o runtime
        console.error("Errore nel recupero del docente:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getDocente = getDocente;
const createDocente = async (req, res) => {
    try {
        const { codice_fiscale, nome, cognome, datanascita, nazione, regione, provincia, comune, sesso, cellulare, mail, cv, contratto } = req.body;
        const docente = await prisma_1.prisma.docente.create({
            data: {
                codice_fiscale,
                nome,
                cognome,
                datanascita,
                nazione,
                regione,
                provincia,
                comune,
                sesso,
                cellulare,
                mail,
                cv,
                contratto
            }
        });
        res.status(201).json(docente);
    }
    catch (err) {
        console.error({
            message: "Errore nella creazione del docente",
            error: err,
        });
        if (err.code === "P2002") {
            return res.status(400).json({ error: "Il codice fiscale è già in uso" });
        }
        res.status(500).json({ error: "Errore creazione docente" });
    }
};
exports.createDocente = createDocente;
const updateDocente = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        const { nome, cognome, datanascita, nazione, regione, provincia, comune, sesso, cellulare, mail, cv, contratto } = req.body;
        const docente = await prisma_1.prisma.docente.update({
            where: { codice_fiscale },
            data: {
                nome,
                cognome,
                datanascita,
                nazione,
                regione,
                provincia,
                comune,
                sesso,
                cellulare,
                mail,
                cv,
                contratto
            }
        });
        res.json(docente);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento del docente",
            error: err,
        });
        res.status(500).json({ error: "Errore aggiornamento docente" });
    }
};
exports.updateDocente = updateDocente;
const deleteDocente = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        await prisma_1.prisma.docente.delete({
            where: { codice_fiscale },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione del docente",
            error: err,
        });
        res.status(500).json({ error: "Errore cancellazione docente" });
    }
};
exports.deleteDocente = deleteDocente;
const getCorsiByDocente = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        const corsi = await prisma_1.prisma.corso_docente.findMany({
            where: { docente_cf: codice_fiscale },
            include: {
                corso: true,
            },
        });
        if (corsi.length === 0) {
            return res.status(404).send("Nessun corso trovato per questo docente");
        }
        // opzionale: ritorno solo i corsi puliti
        const result = corsi.map((c) => c.corso);
        res.json(result);
    }
    catch (err) {
        console.error({
            message: "Errore nel recupero dei corsi del docente",
            error: err,
        });
        res.status(500).json({ error: "Errore recupero corsi docente" });
    }
};
exports.getCorsiByDocente = getCorsiByDocente;
const getModuliByDocente = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        const moduli = await prisma_1.prisma.docente_modulo.findMany({
            where: { docente_cf: codice_fiscale },
            include: {
                modulo: true
            }
        });
        if (moduli.length === 0) {
            return res.status(404).send("Nessuna modulo abilitato per questo docente");
        }
        res.json(moduli);
    }
    catch (err) {
        console.error({
            message: "Errore nella ricerca dei moduli per questo docente",
            error: err,
        });
        res.status(500).json({ error: "Errore ricerca moduli" });
    }
};
exports.getModuliByDocente = getModuliByDocente;
const addModuloToDocente = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        const { modulo_id } = req.body;
        const relazione = await prisma_1.prisma.docente_modulo.create({
            data: {
                docente_cf: codice_fiscale,
                modulo_id
            }
        });
        res.status(201).json(relazione);
    }
    catch (err) {
        console.error("Errore assegnazione modulo al docente", err);
        res.status(500).json({ error: "Errore assegnazione modulo" });
    }
};
exports.addModuloToDocente = addModuloToDocente;
const addModuliToDocenteBulk = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        const { moduli_ids } = req.body;
        if (!moduli_ids || !Array.isArray(moduli_ids)) {
            return res.status(400).json({ error: "Formato dati non valido. Previsto array moduli_ids" });
        }
        const result = await prisma_1.prisma.$transaction([
            prisma_1.prisma.docente_modulo.deleteMany({ where: { docente_cf: codice_fiscale } }),
            prisma_1.prisma.docente_modulo.createMany({
                data: moduli_ids.map(id => ({ docente_cf: codice_fiscale, modulo_id: id })),
                skipDuplicates: true,
            }),
        ]);
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Errore assegnazione massiva moduli al docente", err);
        res.status(500).json({ error: "Errore assegnazione moduli" });
    }
};
exports.addModuliToDocenteBulk = addModuliToDocenteBulk;
const deleteModuloFromDocente = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        const modulo_id = Number(req.params.modulo_id);
        const relazione = await prisma_1.prisma.docente_modulo.delete({
            where: {
                docente_cf_modulo_id: {
                    docente_cf: codice_fiscale,
                    modulo_id,
                },
            },
        });
        return res.status(200).json(relazione);
    }
    catch (err) {
        console.error("Errore cancellazione modulo dal docente", err);
        return res.status(500).json({ error: "Errore cancellazione docente" });
    }
};
exports.deleteModuloFromDocente = deleteModuloFromDocente;
