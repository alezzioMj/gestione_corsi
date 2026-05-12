import express from "express";
const programmaRouter= express.Router();
import { validate} from "../middlewares/validate";
import { programmaSchema } from "../validation/programma.schema";
import {
  getProgrammi,
  getProgramma,
  createProgramma,
  updateProgramma,
  deleteProgramma,
  getModuliByProgramma,
  addModuloToProgramma,
  addModuloToProgrammaBulk,
  deleteModuloFromProgramma
} from '../controllers/programmaController';

programmaRouter.get('/', getProgrammi);
programmaRouter.get('/:id', getProgramma);
programmaRouter.post('/', validate(programmaSchema), createProgramma);
programmaRouter.put('/:id', validate(programmaSchema), updateProgramma);
programmaRouter.delete('/:id', deleteProgramma);

//MODULI
programmaRouter.get("/:id/moduli", getModuliByProgramma);
programmaRouter.post("/:id/moduli", addModuloToProgramma);
programmaRouter.post("/:id/moduli_bulk", addModuloToProgrammaBulk);
programmaRouter.delete("/:id/moduli/:modulo_id", deleteModuloFromProgramma);

export default programmaRouter;