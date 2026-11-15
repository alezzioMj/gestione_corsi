import express from "express";
const commessaRouter = express.Router();
import { validate } from "../middlewares/validate";
import { createCliente, deleteCliente, getClienti, updateCliente } from "../controllers/clientiController";
import { createCorso, getCorsi } from "../controllers/corsoController";
import { createCommessaSchema } from "@progetto/shared/validation/commessa.schema";

commessaRouter.get('/', getCorsi);
commessaRouter.post('/', validate(createCommessaSchema), createCorso);
commessaRouter.delete('/:id', deleteCliente);

export default commessaRouter;