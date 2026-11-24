import express from "express";
const aulaRouter= express.Router();
import { validate } from "../middlewares/validate";
import { aulaSchema, createAulaSchema, updateAulaSchema } from "@progetto/shared/validation/aula.schema";
import { getAula , getAule, createAula, updateAula, deleteAula } from '../controllers/aulaController';


aulaRouter.get('/', getAule);
aulaRouter.get('/:id', getAula);
aulaRouter.post('/', validate(createAulaSchema), createAula);
aulaRouter.put('/:id', validate(updateAulaSchema),updateAula);
aulaRouter.delete('/:id', deleteAula);

export default aulaRouter;