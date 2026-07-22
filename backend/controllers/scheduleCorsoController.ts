import express from "express";
import { schedule } from "../services/scheduler.service";

const scheduleCorsoController = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const corso_id = Number(req.params.id);

    const { giorniDisponibili } = req.body;
    
    const { ordine } = req.body;

    if (!Array.isArray(giorniDisponibili)) {
      return res.status(400).json({
        error: "giorniDisponibili deve essere un array di numeri (0-6)",
      });
    }

    if (!Array.isArray(ordine)){
      return res.status(400).json({
        error: "ordine deve essere un array di oggetto Ordine (modulo_id, ordine)",
      });
    }



    const result = await schedule(corso_id, giorniDisponibili, ordine);

    return res.status(200).json({
      message: "Scheduling completato con successo",
      sessioni_create: result?.length || 0,
      data: result,
    });
  } catch (err: any) {
    console.error("Errore scheduling:", err.message);

    return res.status(500).json({
      error: err.message || "Errore scheduling",
    });
  }
};

export { scheduleCorsoController };