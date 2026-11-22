import express from "express";
import { schedule } from "../services/scheduler.service";
import { SchedulingError } from "../services/availability.service";

const scheduleCorsoController = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const corso_id = Number(req.params.id);
    const { giorniDisponibili, moduliOrdinati, ordine: ordineRaw } = req.body;

    if (!Array.isArray(giorniDisponibili)) {
      return res.status(400).json({
        error: "giorniDisponibili deve essere un array di numeri (0-6)",
      });
    }
    const listaGrezza = moduliOrdinati || ordineRaw;

    if (!Array.isArray(listaGrezza)) {
      return res.status(400).json({
        error: "È necessario fornire un array di moduli ordinati",
      });
    }

    const ordineNormalizzato = listaGrezza.map((item: any, index: number) => {
      if (typeof item === "string") {
        const moduloId = Number(item.split("-")[0]); // Prende solo il "15" prima del trattino
        return {
          modulo_id: moduloId,
          ordine: index + 1 // Mantiene l'indice progressivo (1, 2, 3...)
        };
      }
      // Se l'elemento era già un oggetto { modulo_id: 15, ordine: 1 }
      return {
        modulo_id: Number(item.modulo_id),
        ordine: index + 1
      };
    });

    const result = await schedule(corso_id, giorniDisponibili, ordineNormalizzato);

    return res.status(200).json({
      message: "Scheduling completato con successo",
      sessioni_create: result?.length || 0,
      data: result,
    });
  } catch (err) {
    if (err instanceof SchedulingError) {
      return res.status(err.status).json({
        code: err.code,
        message: err.message,
        details: err.details,
      });
    }

    console.error("Errore scheduling:", err);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Errore interno durante la schedulazione",
    });
  }
};

export { scheduleCorsoController };