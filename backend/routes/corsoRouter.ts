import express from "express";
const corsiRouter = express.Router();

import { validate } from "../middlewares/validate";
import { corsoSchema, createCorsoSchema, updateCorsoSchema } from "@progetto/shared/validation/corso.schema";

import {
  getCorsi,
  getCorso,
  updateCorso,
  deleteCorso,
  getDocenti,
  addDocenteToCorso,
  deleteDocenteFromCorso,
  getSediByCorso,
  addSedeToCorso,
  deleteSedeFromCorso,
  deleteSessioni,
  createCorso
} from "../controllers/corsoController";
import { confermaSchedulingController, getBozzeController, scartaSchedulingController, scheduleCorsoController } from "../controllers/scheduleCorsoController";
import { getDocentiByModulo } from "../controllers/corsoController";

corsiRouter.get("/", getCorsi);
corsiRouter.get("/:id", getCorso);

corsiRouter.post("/", validate(createCorsoSchema), createCorso);
corsiRouter.put("/:id", validate(updateCorsoSchema), updateCorso);
corsiRouter.delete("/:id", deleteCorso);

// DOCENTI
corsiRouter.get("/:id/docenti", getDocenti);
corsiRouter.get("/:id/docenti/:modulo_id", getDocentiByModulo);
corsiRouter.post("/:id/docenti", addDocenteToCorso);
corsiRouter.delete("/:id/docenti/:docente_cf", deleteDocenteFromCorso);

// SEDI
corsiRouter.get("/:id/sedi", getSediByCorso);
corsiRouter.post("/:id/sedi", addSedeToCorso);
corsiRouter.delete("/:id/sedi/:sede_id", deleteSedeFromCorso);

//SCHEDULAZIONE
corsiRouter.get("/:id/scheduling", getBozzeController);     
corsiRouter.post("/:id/scheduling", scheduleCorsoController);
corsiRouter.post("/:id/scheduling/conferma", confermaSchedulingController);
corsiRouter.delete("/:id/scheduling", scartaSchedulingController);

export default corsiRouter;