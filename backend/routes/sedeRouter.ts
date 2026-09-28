import express from "express";
const sediRouter = express.Router();
import { validate} from "../middlewares/validate";
import { sedeSchema } from "@progetto/shared/validation/sede.schema";
import { getSedi , getSede, createSede, updateSede, deleteSede, getCorsiBySede } from '../controllers/sedeController';

sediRouter.get('/', getSedi);
sediRouter.get('/:id', getSede);
sediRouter.post('/', validate(sedeSchema), createSede);
sediRouter.put('/:id', validate(sedeSchema), updateSede);
sediRouter.delete('/:id', deleteSede);

//CORSI
sediRouter.get('/:id/corsi', getCorsiBySede);

export default sediRouter;