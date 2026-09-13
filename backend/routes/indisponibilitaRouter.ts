import express from "express";
const indisponibilitaRouter = express.Router();
import { validate} from "../middlewares/validate";
import { indisponibilitaSchema } from "@shared/validation/indisponibilita.schema";
import { getIndisponibilita , getIndisponibilitaById, createIndisponibilita, updateIndisponibilita, deleteIndisponibilita } from '../controllers/indisponibilitaController';

indisponibilitaRouter .get('/', getIndisponibilita);
indisponibilitaRouter .get('/:id', getIndisponibilitaById);
indisponibilitaRouter .post('/', validate(indisponibilitaSchema), createIndisponibilita);
indisponibilitaRouter .put('/:id', validate(indisponibilitaSchema), updateIndisponibilita);
indisponibilitaRouter .delete('/:id', deleteIndisponibilita);

export default indisponibilitaRouter ;