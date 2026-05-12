import express from "express";
const corsiRouter = express.Router();

import { validate } from "../middlewares/validate";
import { corsoSchema } from "../validation/corso.schema";

import {
  getCorsi,
  getCorso,
  createCorso,
  updateCorso,
  deleteCorso,
  getDocenti,
  addDocenteToCorso,
  deleteDocenteFromCorso,
  getSediByCorso,
  addSedeToCorso,
  deleteSedeFromCorso
} from "../controllers/corsoController";
import { scheduleCorsoController } from "../controllers/scheduleCorsoController";

corsiRouter.get("/", getCorsi);
corsiRouter.get("/:id", getCorso);

corsiRouter.post("/", validate(corsoSchema), createCorso);
corsiRouter.put("/:id", validate(corsoSchema), updateCorso);
corsiRouter.delete("/:id", deleteCorso);

// DOCENTI
corsiRouter.get("/:id/docenti", getDocenti);
corsiRouter.post("/:id/docenti", addDocenteToCorso);
corsiRouter.delete("/:id/docenti/:docente_cf", deleteDocenteFromCorso);

// SEDI
corsiRouter.get("/:id/sedi", getSediByCorso);
corsiRouter.post("/:id/sedi", addSedeToCorso);
corsiRouter.delete("/:id/sedi/:sede_id", deleteSedeFromCorso);

//SCHEDULAZIONE
corsiRouter.post("/:id/schedule", scheduleCorsoController);

export default corsiRouter;