import express from "express";
const commessaRouter = express.Router();
import { validate } from "../middlewares/validate";
import { createCommessaSchema, updateCommessaSchema } from "@progetto/shared/validation/commessa.schema";
import { createCommessa, deleteCommessa, downloadSchedaCommessa, getCommesse, updateCommessa } from "../controllers/commessaController";

commessaRouter.get('/', getCommesse);
commessaRouter.post('/', validate(createCommessaSchema), createCommessa);
commessaRouter.put('/:id', validate(updateCommessaSchema), updateCommessa);
commessaRouter.delete('/:id', deleteCommessa);
commessaRouter.get("/:id/scheda-commessa", downloadSchedaCommessa);

export default commessaRouter;