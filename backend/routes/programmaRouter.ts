import express from "express";
const programmaRouter= express.Router();
import { validate} from "../middlewares/validate";
import { createProgrammaSchema, programmaSchema, updateProgrammaSchema } from "@progetto/shared/validation/programma.schema";
import {
  getProgrammi,
  getProgramma,
  createProgramma,
  updateProgramma,
  deleteProgramma,
  getModuliByProgramma,
  addModuloToProgramma,
  addModuloToProgrammaBulk,
  deleteModuloFromProgramma,
  createCompleteProgramma
} from '../controllers/programmaController';

programmaRouter.get('/', getProgrammi);
programmaRouter.get('/:id', getProgramma);
programmaRouter.post('/', validate(createProgrammaSchema), createProgramma);
programmaRouter.put('/:id', validate(updateProgrammaSchema.partial()), updateProgramma);
programmaRouter.delete('/:id', deleteProgramma);

//MODULI
programmaRouter.get("/:id/moduli", getModuliByProgramma);
programmaRouter.post("/:id/moduli", addModuloToProgramma);
programmaRouter.post("/:id/moduli_bulk", addModuloToProgrammaBulk);
programmaRouter.delete("/:id/moduli/:modulo_id", deleteModuloFromProgramma);

programmaRouter.post("/completo", createCompleteProgramma);

export default programmaRouter;