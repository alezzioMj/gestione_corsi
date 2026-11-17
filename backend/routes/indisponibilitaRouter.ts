import express from "express";
const indisponibilitaRouter = express.Router();
import { validate } from "../middlewares/validate";
import { createIndisponibilitaSchema, updateIndisponibilitaSchema } from "@progetto/shared/validation/indisponibilita.schema";
import { getIndisponibilita, getIndisponibilitaById, createIndisponibilita, updateIndisponibilita, deleteIndisponibilita } from '../controllers/indisponibilitaController';

indisponibilitaRouter.get('/', getIndisponibilita);
indisponibilitaRouter.get('/:id', getIndisponibilitaById);
indisponibilitaRouter.post('/', validate(createIndisponibilitaSchema), createIndisponibilita);
indisponibilitaRouter.put('/:id', validate(updateIndisponibilitaSchema), updateIndisponibilita);
indisponibilitaRouter.delete('/:id', deleteIndisponibilita);

export default indisponibilitaRouter;