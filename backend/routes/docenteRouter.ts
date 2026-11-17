import express from "express";
const docenteRouter = express.Router();
import { validate } from "../middlewares/validate";
import { createDocenteSchema, updateDocenteSchema } from "@progetto/shared/validation/docente.schema";
import { getDocenti , getDocente, createDocente, updateDocente, deleteDocente, getCorsiByDocente, getModuliByDocente, addModuloToDocente, addModuliToDocenteBulk, deleteModuloFromDocente } from '../controllers/docenteController';

docenteRouter.get('/', getDocenti);
docenteRouter.get('/:codice_fiscale', getDocente);
docenteRouter.post('/', validate(createDocenteSchema), createDocente);
docenteRouter.put('/:codice_fiscale', validate(updateDocenteSchema), updateDocente);
docenteRouter.delete('/:codice_fiscale', deleteDocente);

//CORSI
docenteRouter.get('/:codice_fiscale/corsi', getCorsiByDocente);

//MODULI
docenteRouter.get('/:codice_fiscale/moduli', getModuliByDocente);
docenteRouter.post('/:codice_fiscale/moduli', addModuloToDocente);
docenteRouter.post('/:codice_fiscale/moduli_bulk', addModuliToDocenteBulk);
docenteRouter.delete('/:codice_fiscale/moduli/:modulo_id', deleteModuloFromDocente);

export default docenteRouter;