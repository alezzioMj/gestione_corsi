import express from "express";
import {
  getSessioniService,
  getSessioniFullService,
  getSessioneService,
  createSessioneService,
  updateSessioneService,
  deleteSessioneService,
} from "../services/sessione.service";

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

// UPDATE
export const updateSessione = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = Number(req.params.id);

    const sessione = await updateSessioneService(id, req.body);

    return res.status(200).json(sessione);
  } catch (err: any) {
    console.error("Errore aggiornamento sessione:", err);

    return res.status(400).json({
      error: err.message || "Errore aggiornamento sessione",
    });
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