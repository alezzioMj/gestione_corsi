import express from "express";
const docenteRouter = express.Router();
import { validate } from "../middlewares/validate";
import { docenteSchema } from "@progetto/shared/validation/docente.schema";
import { getDocenti , getDocente, createDocente, updateDocente, deleteDocente, getCorsiByDocente, getModuliByDocente, addModuloToDocente, addModuliToDocenteBulk, deleteModuloFromDocente } from '../controllers/docenteController';

docenteRouter.get('/', getDocenti);
docenteRouter.get('/:codice_fiscale', getDocente);
docenteRouter.post('/', validate(docenteSchema), createDocente);
docenteRouter.put('/:codice_fiscale', validate(docenteSchema), updateDocente);
docenteRouter.delete('/:codice_fiscale', deleteDocente);

//CORSI
docenteRouter.get('/:codice_fiscale/corsi', getCorsiByDocente);

//MODULI
docenteRouter.get('/:codice_fiscale/moduli', getModuliByDocente);
docenteRouter.post('/:codice_fiscale/moduli', addModuloToDocente);
docenteRouter.post('/:codice_fiscale/moduli_bulk', addModuliToDocenteBulk);
docenteRouter.delete('/:codice_fiscale/moduli/:modulo_id', deleteModuloFromDocente);

export default docenteRouter;