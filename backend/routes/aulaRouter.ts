import express from "express";
const aulaRouter= express.Router();
import { validate } from "../middlewares/validate";
import { aulaSchema } from "@progetto/shared/validation/aula.schema";
import { getAula , getAule, createAula, updateAula, deleteAula } from '../controllers/aulaController';


aulaRouter.get('/', getAule);
aulaRouter.get('/:id', getAula);
aulaRouter.post('/', validate(aulaSchema), createAula);
aulaRouter.put('/:id', validate(aulaSchema),updateAula);
aulaRouter.delete('/:id', deleteAula);

export default aulaRouter;