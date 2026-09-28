import express from "express";
const sessioneRouter= express.Router();
import { validate} from "../middlewares/validate";
import { sessioneSchema } from "@progetto/shared/validation/sessione.schema";
import { getSessione, getSessioni, createSessione, updateSessione, deleteSessione, getSessioniFull} from '../controllers/sessioneController';

sessioneRouter.get('/', getSessioni);
sessioneRouter.get("/full", getSessioniFull);
sessioneRouter.get('/:id', getSessione);
sessioneRouter.post('/', validate(sessioneSchema), createSessione);
sessioneRouter.put('/:id', validate(sessioneSchema), updateSessione);
sessioneRouter.delete('/:id', deleteSessione);

export default sessioneRouter;