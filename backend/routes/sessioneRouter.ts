import express from "express";
const sessioneRouter= express.Router();
import { validate} from "../middlewares/validate";
import { createSessioneSchema, updateSessioneSchema } from "@progetto/shared/validation/sessione.schema";
import { getSessione, getSessioni, createSessione, deleteSessione, getSessioniFull, updateSessioneController} from '../controllers/sessioneController';

sessioneRouter.get('/', getSessioni);
sessioneRouter.get("/full", getSessioniFull);
sessioneRouter.get('/:id', getSessione);
sessioneRouter.post('/', validate(createSessioneSchema), createSessione);
sessioneRouter.put("/:id", updateSessioneController);
sessioneRouter.delete('/:id', deleteSessione);

export default sessioneRouter;