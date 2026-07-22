"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCorsoController = void 0;
const scheduler_service_1 = require("../services/scheduler.service");
const scheduleCorsoController = async (req, res) => {
    try {
        const corso_id = Number(req.params.id);
        const { giorniDisponibili } = req.body;
        const { ordine } = req.body;
        if (!Array.isArray(giorniDisponibili)) {
            return res.status(400).json({
                error: "giorniDisponibili deve essere un array di numeri (0-6)",
            });
        }
        if (!Array.isArray(ordine)) {
            return res.status(400).json({
                error: "ordine deve essere un array di oggetto Ordine (modulo_id, ordine)",
            });
        }
        const result = await (0, scheduler_service_1.schedule)(corso_id, giorniDisponibili, ordine);
        return res.status(200).json({
            message: "Scheduling completato con successo",
            sessioni_create: result?.length || 0,
            data: result,
        });
    }
    catch (err) {
        console.error("Errore scheduling:", err.message);
        return res.status(500).json({
            error: err.message || "Errore scheduling",
        });
    }
};
exports.scheduleCorsoController = scheduleCorsoController;
