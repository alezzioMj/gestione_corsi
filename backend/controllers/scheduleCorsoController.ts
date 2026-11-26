import express from "express";
import { z } from "zod";
import { stato_sessione_enum } from "@prisma/client";
import { prisma } from "../prisma";
import { confermaBozze, scartaBozze, schedule } from "../services/scheduler.service";
import { calcolaConflitti, daVerificare } from "../services/conflicts.service";
import { SchedulingError } from "../services/availability.service";
import type { Ordine } from "../services/availability.service";

const moduloItem = z.union([
  z.string().regex(/^\d+(-.*)?$/, "Formato modulo non valido (atteso 'id' o 'id-...')"),
  z.object({ modulo_id: z.coerce.number().int().positive() }),
]);

const scheduleBodySchema = z
  .object({
    giorniDisponibili: z
      .array(z.number().int().min(1).max(7)) // 1 = lunedì ... 7 = domenica
      .min(1, "Seleziona almeno un giorno")
      .refine((g) => new Set(g).size === g.length, "Giorni duplicati"),
    moduliOrdinati: z.array(moduloItem).optional(),
    ordine: z.array(moduloItem).optional(), // alias: tieni solo quello usato dal frontend
  })
  .refine((b) => (b.moduliOrdinati ?? b.ordine ?? []).length > 0, {
    message: "È necessario fornire un array di moduli ordinati",
  });

const parseCorsoId = (req: express.Request) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const normalizzaOrdine = (lista: z.infer<typeof moduloItem>[]): Ordine[] =>
  lista.map((item, index) => ({
    modulo_id: typeof item === "string" ? Number(item.split("-")[0]) : item.modulo_id,
    ordine: index + 1,
  }));

const handleError = (res: express.Response, err: unknown, contesto: string) => {
  if (err instanceof SchedulingError) {
    return res.status(err.status).json({ code: err.code, message: err.message, details: err.details });
  }
  console.error(`Errore ${contesto}:`, err);
  return res.status(500).json({ code: "INTERNAL_ERROR", message: "Errore interno durante la schedulazione" });
};

// ---------------------------------------------------------------------------
// POST /corsi/:id/scheduling: genera le sessioni come bozza
// ---------------------------------------------------------------------------

const scheduleCorsoController = async (req: express.Request, res: express.Response) => {
  const corso_id = parseCorsoId(req);
  if (!corso_id) return res.status(400).json({ error: "Id corso non valido" });

  const parsed = scheduleBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dati non validi", details: parsed.error.issues });
  }

  const { giorniDisponibili, moduliOrdinati, ordine } = parsed.data;
  const ordineNormalizzato = normalizzaOrdine(moduliOrdinati ?? ordine ?? []);

  const ids = ordineNormalizzato.map((o) => o.modulo_id);
  if (new Set(ids).size !== ids.length) {
    return res.status(400).json({ error: "Moduli duplicati nell'ordine" });
  }

  try {
    const sessioni = await schedule(corso_id, giorniDisponibili, ordineNormalizzato);

    return res.status(201).json({
      message: "Bozza di scheduling creata",
      sessioni_create: sessioni.length,
      data: sessioni,
    });
  } catch (err) {
    return handleError(res, err, "scheduling");
  }
};

// ---------------------------------------------------------------------------
// GET /corsi/:id/scheduling/conflitti: conflitti delle bozze del corso
// ---------------------------------------------------------------------------

const getConflittiController = async (req: express.Request, res: express.Response) => {
  const corso_id = parseCorsoId(req);
  if (!corso_id) return res.status(400).json({ error: "Id corso non valido" });

  try {
    const bozze = await prisma.sessione.findMany({
      where: { corso_id, stato: stato_sessione_enum.Bozza },
    });

    const { complete, incomplete } = daVerificare(bozze);
    const risultati = await calcolaConflitti(prisma, corso_id, complete);

    return res.status(200).json({
      conflitti: risultati.filter((r) => r.conflitti.length > 0), // [{ id, conflitti: [...] }]
      incomplete, // id delle bozze senza docente, aula o sede
    });
  } catch (err) {
    return handleError(res, err, "calcolo conflitti");
  }
};

const confermaSchedulingController = async (req: express.Request, res: express.Response) => {
  const corso_id = parseCorsoId(req);
  if (!corso_id) return res.status(400).json({ error: "Id corso non valido" });

  try {
    const confermate = await confermaBozze(corso_id);
    return res.status(200).json({ message: "Sessioni confermate", sessioni_confermate: confermate });
  } catch (err) {
    return handleError(res, err, "conferma scheduling");
  }
};

// ---------------------------------------------------------------------------
// DELETE /corsi/:id/scheduling: scarta le bozze del corso
// ---------------------------------------------------------------------------

const scartaSchedulingController = async (req: express.Request, res: express.Response) => {
  const corso_id = parseCorsoId(req);
  if (!corso_id) return res.status(400).json({ error: "Id corso non valido" });

  try {
    const eliminate = await scartaBozze(corso_id);
    return res.status(200).json({ message: "Bozze eliminate", sessioni_eliminate: eliminate });
  } catch (err) {
    return handleError(res, err, "scarto bozze");
  }
};

export {
  scheduleCorsoController,
  getConflittiController,
  confermaSchedulingController,
  scartaSchedulingController,
};