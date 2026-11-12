"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSessione = exports.updateSessione = exports.createSessione = exports.getSessione = exports.getSessioniFull = exports.getSessioni = void 0;
const sessione_service_1 = require("../services/sessione.service");
// GET ALL
const getSessioni = async (req, res) => {
    try {
        const sessioni = await (0, sessione_service_1.getSessioniService)();
        return res.status(200).json(sessioni);
    }
    catch (err) {
        console.error("Errore recupero sessioni:", err);
        return res.status(500).json({
            error: "Errore recupero sessioni",
        });
    }
};
exports.getSessioni = getSessioni;
// GET ALL FULLSERVICE
const getSessioniFull = async (req, res) => {
    try {
        const sessioni = await (0, sessione_service_1.getSessioniFullService)();
        return res.status(200).json(sessioni);
    }
    catch (err) {
        console.error("Errore recupero sessioni:", err);
        return res.status(500).json({
            error: "Errore recupero sessioni",
        });
    }
};
exports.getSessioniFull = getSessioniFull;
// GET ONE
const getSessione = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const sessione = await (0, sessione_service_1.getSessioneService)(id);
        if (!sessione) {
            return res.status(404).json({
                error: "Sessione non trovata",
            });
        }
        return res.status(200).json(sessione);
    }
    catch (err) {
        console.error("Errore recupero sessione:", err);
        return res.status(500).json({
            error: "Errore recupero sessione",
        });
    }
};
exports.getSessione = getSessione;
// CREATE
const createSessione = async (req, res) => {
    try {
        const sessione = await (0, sessione_service_1.createSessioneService)(req.body);
        return res.status(201).json(sessione);
    }
    catch (err) {
        console.error("Errore creazione sessione:", err);
        return res.status(400).json({
            error: err.message || "Errore creazione sessione",
        });
    }
};
exports.createSessione = createSessione;
// UPDATE
const updateSessione = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const sessione = await (0, sessione_service_1.updateSessioneService)(id, req.body);
        return res.status(200).json(sessione);
    }
    catch (err) {
        console.error("Errore aggiornamento sessione:", err);
        return res.status(400).json({
            error: err.message || "Errore aggiornamento sessione",
        });
    }
};
exports.updateSessione = updateSessione;
// DELETE
const deleteSessione = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await (0, sessione_service_1.deleteSessioneService)(id);
        return res.sendStatus(204);
    }
    catch (err) {
        console.error("Errore eliminazione sessione:", err);
        return res.status(500).json({
            error: "Errore eliminazione sessione",
        });
    }
};
exports.deleteSessione = deleteSessione;
