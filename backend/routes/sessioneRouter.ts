import express from "express";
const sessioneRouter= express.Router();
import { validate} from "../middlewares/validate";
import { createSessioneSchema, updateSessioneSchema } from "@progetto/shared/validation/sessione.schema";
import { getSessione, getSessioni, createSessione, updateSessione, deleteSessione, getSessioniFull} from '../controllers/sessioneController';

sessioneRouter.get('/', getSessioni);
sessioneRouter.get("/full", getSessioniFull);
sessioneRouter.get('/:id', getSessione);
sessioneRouter.post('/', validate(createSessioneSchema), createSessione);
sessioneRouter.put('/:id', validate(updateSessioneSchema), updateSessione);
sessioneRouter.delete('/:id', deleteSessione);

export default sessioneRouter;