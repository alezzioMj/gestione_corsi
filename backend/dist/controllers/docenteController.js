"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteModuloFromDocente = exports.addModuliToDocenteBulk = exports.addModuloToDocente = exports.getModuliByDocente = exports.getCorsiByDocente = exports.deleteDocente = exports.updateDocente = exports.createDocente = exports.getDocente = exports.getDocenti = void 0;
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
const include_1 = require("./utility.ts/include");
const date_1 = require("./utility.ts/date");
const INCLUDE_MAP = {
    docente_modulo: { include: { modulo: true } },
    corso_docente: { include: { corso: true } },
};
const getDocenti = async (req, res) => {
    try {
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const docenti = await prisma_1.prisma.docente.findMany({
            include,
        });
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
        const include = (0, include_1.buildInclude)(req, INCLUDE_MAP);
        const docente = await prisma_1.prisma.docente.findUnique({
            where: { codice_fiscale },
            include,
        });
        if (!docente) {
            return res.status(404).send("Docente non trovato");
        }
        res.json(docente);
    }
    catch (error) {
        console.error("Errore nel recupero del docente:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getDocente = getDocente;
const createDocente = async (req, res) => {
    try {
        const { codice_fiscale, colore, nome, cognome, datanascita, nazione, regione, provincia, comune, sesso, cellulare, mail, cv, contratto, } = req.body;
        const docente = await prisma_1.prisma.docente.create({
            data: {
                codice_fiscale,
                colore,
                nome,
                cognome,
                datanascita: (0, date_1.toDate)(datanascita),
                nazione,
                regione,
                provincia,
                comune,
                sesso,
                cellulare,
                mail,
                cv,
                contratto,
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP),
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
        if (err.code === "P2000") {
            return res.status(400).json({ error: "Uno dei valori inseriti è troppo lungo" });
        }
        if (err instanceof client_1.Prisma.PrismaClientValidationError) {
            return res.status(400).json({ error: "Dati del docente non validi" });
        }
        res.status(500).json({ error: "Errore creazione docente" });
    }
};
exports.createDocente = createDocente;
const updateDocente = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        const { colore, nome, cognome, datanascita, nazione, regione, provincia, comune, sesso, cellulare, mail, cv, contratto, } = req.body;
        const docente = await prisma_1.prisma.docente.update({
            where: { codice_fiscale },
            data: {
                colore,
                nome,
                cognome,
                datanascita: (0, date_1.toDate)(datanascita),
                nazione,
                regione,
                provincia,
                comune,
                sesso,
                cellulare,
                mail,
                cv,
                contratto,
            },
            include: (0, include_1.buildInclude)(req, INCLUDE_MAP),
        });
        res.json(docente);
    }
    catch (err) {
        console.error({
            message: "Errore nell'aggiornamento del docente",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Docente non trovato" });
        }
        if (err.code === "P2000") {
            return res.status(400).json({ error: "Uno dei valori inseriti è troppo lungo" });
        }
        if (err instanceof client_1.Prisma.PrismaClientValidationError) {
            return res.status(400).json({ error: "Dati del docente non validi" });
        }
        res.status(500).json({ error: "Errore aggiornamento docente" });
    }
};
exports.updateDocente = updateDocente;
// corso_docente e docente_modulo sono in cascade; indisponibilita no (P2003).
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
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Docente non trovato" });
        }
        if (err.code === "P2003") {
            return res.status(409).json({ error: "Impossibile eliminare il docente: ha indisponibilità collegate" });
        }
        res.status(500).json({ error: "Errore cancellazione docente" });
    }
};
exports.deleteDocente = deleteDocente;
const getCorsiByDocente = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        const corsi = await prisma_1.prisma.corso_docente.findMany({
            where: { docente_cf: codice_fiscale },
            include: { corso: true },
        });
        res.json(corsi.map((c) => c.corso));
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
            include: { modulo: true },
        });
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
                modulo_id,
            },
        });
        res.status(201).json(relazione);
    }
    catch (err) {
        console.error({
            message: "Errore nell'assegnazione del modulo al docente",
            error: err,
        });
        if (err.code === "P2002") {
            return res.status(409).json({ error: "Il modulo è già assegnato al docente" });
        }
        if (err.code === "P2003") {
            return res.status(400).json({ error: "Il docente o il modulo non esiste" });
        }
        res.status(500).json({ error: "Errore assegnazione modulo" });
    }
};
exports.addModuloToDocente = addModuloToDocente;
// Sostituisce l'intero elenco dei moduli del docente
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
                data: moduli_ids.map((id) => ({ docente_cf: codice_fiscale, modulo_id: id })),
                skipDuplicates: true,
            }),
        ]);
        res.status(201).json(result);
    }
    catch (err) {
        console.error({
            message: "Errore nell'assegnazione massiva dei moduli al docente",
            error: err,
        });
        if (err.code === "P2003") {
            return res.status(400).json({ error: "Il docente o uno dei moduli non esiste" });
        }
        res.status(500).json({ error: "Errore assegnazione moduli" });
    }
};
exports.addModuliToDocenteBulk = addModuliToDocenteBulk;
const deleteModuloFromDocente = async (req, res) => {
    try {
        const { codice_fiscale } = req.params;
        const modulo_id = Number(req.params.modulo_id);
        await prisma_1.prisma.docente_modulo.delete({
            where: {
                docente_cf_modulo_id: { docente_cf: codice_fiscale, modulo_id },
            },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error({
            message: "Errore nella cancellazione del modulo dal docente",
            error: err,
        });
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Modulo non assegnato a questo docente" });
        }
        res.status(500).json({ error: "Errore cancellazione modulo" });
    }
};
exports.deleteModuloFromDocente = deleteModuloFromDocente;
