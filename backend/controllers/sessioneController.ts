import express from "express";
import {
  getSessioniService,
  getSessioniFullService,
  getSessioneService,
  createSessioneService,
  updateSessioneService,
  deleteSessioneService,
  updateSessione,
} from "../services/sessione.service";
import { stato_sessione_enum } from "@prisma/client";
import z from "zod";
import { prisma } from "../prisma";
import { SchedulingError } from "../services/availability.service";
import { daVerificare, calcolaConflitti } from "../services/conflicts.service";

// GET ALL
export const getSessioni = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const sessioni = await getSessioniService();

    return res.status(200).json(sessioni);
  } catch (err) {
    console.error("Errore recupero sessioni:", err);
    return res.status(500).json({
      error: "Errore recupero sessioni",
    });
  }
};

// GET ALL FULLSERVICE
export const getSessioniFull = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const sessioni = await getSessioniFullService();

    return res.status(200).json(sessioni);
  } catch (err) {
    console.error("Errore recupero sessioni:", err);
    return res.status(500).json({
      error: "Errore recupero sessioni",
    });
  }
};

// GET ONE
export const getSessione = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = Number(req.params.id);

    const sessione = await getSessioneService(id);

    if (!sessione) {
      return res.status(404).json({
        error: "Sessione non trovata",
      });
    }

    return res.status(200).json(sessione);
  } catch (err) {
    console.error("Errore recupero sessione:", err);
    return res.status(500).json({
      error: "Errore recupero sessione",
    });
  }
};

// CREATE
export const createSessione = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const sessione = await createSessioneService(req.body);

    return res.status(201).json(sessione);
  } catch (err: any) {
    console.error("Errore creazione sessione:", err);

    return res.status(400).json({
      error: err.message || "Errore creazione sessione",
    });
  }
};

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato orario HH:mm");

const patchSchema = z
    .object({
        data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato data YYYY-MM-DD")
            .transform((d) => new Date(`${d}T00:00:00.000Z`)),
        ora_inizio: hhmm,
        ora_fine: hhmm,
        docente_cf: z.string().min(1),
        aula_id: z.number().int().positive(),
        sede_id: z.number().int().positive(),
        note: z.string().nullable(),
    })
    .partial()
    .refine((p) => Object.keys(p).length > 0, "Nessun campo da modificare");

const handleError = (res: express.Response, err: unknown) => {
    if (err instanceof SchedulingError) {
        return res.status(err.status).json({ code: err.code, message: err.message, details: err.details });
    }
    console.error(err);
    return res.status(500).json({ code: "INTERNAL_ERROR", message: "Errore interno" });
};

// PUT /sessioni/:id
export const updateSessioneController = async (req: express.Request, res: express.Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Id sessione non valido" });

    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dati non validi", details: parsed.error.issues });

    try {
        return res.status(200).json(await updateSessione(id, parsed.data));
    } catch (err) {
        return handleError(res, err);
    }
};

// DELETE
export const deleteSessione = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = Number(req.params.id);

    await deleteSessioneService(id);

    return res.sendStatus(204);
  } catch (err) {
    console.error("Errore eliminazione sessione:", err);

    return res.status(500).json({
      error: "Errore eliminazione sessione",
    });
  }
};