import express from "express";
import { schedule } from "../services/scheduler.service";

const scheduleCorsoController = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const corso_id = Number(req.params.id);
    const { giorniDisponibili, moduliOrdinati, ordine: ordineRaw } = req.body;

    // VALIDAZIONE 1:  giorni disponibili devono essere array
    if (!Array.isArray(giorniDisponibili)) {
      return res.status(400).json({
        error: "giorniDisponibili deve essere un array di numeri (0-6)",
      });
    }
    // Recuperiamo l'array inviato dal frontend (sia che si chiami moduliOrdinati o ordine)
    const listaGrezza = moduliOrdinati || ordineRaw;

    // VALIDAZIONE 2: Verifichiamo che l'elenco dei moduli esista e sia un array
    if (!Array.isArray(listaGrezza)) {
      return res.status(400).json({
        error: "È necessario fornire un array di moduli ordinati",
      });
    }

    // TRASFORMAZIONE PASSO PASSO:
    // Convertiamo ogni elemento dell'array per farlo capire allo scheduler.
    // Esempio input: ["1-172423111", "2-172423222", "1-172423333"]
    const ordineNormalizzato = listaGrezza.map((item: any, index: number) => {
      // Se l'elemento è una stringa con il timestamp (es. "15-1724234567")
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

    // Passiamo allo scheduler l'array pulito che contiene TUTTE le istanze
    const result = await schedule(corso_id, giorniDisponibili, ordineNormalizzato);

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