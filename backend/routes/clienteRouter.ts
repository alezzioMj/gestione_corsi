import express from "express";
const clienteRouter= express.Router();
import { validate } from "../middlewares/validate";
import { aulaSchema } from "@progetto/shared/validation/aula.schema";
import { createCliente, deleteCliente, getClienti, updateCliente } from "../controllers/clientiController";
import { ClienteUpdateSchema } from "@progetto/shared/validation/types";

clienteRouter.get('/', getClienti);
clienteRouter.post('/', validate(ClienteUpdateSchema), createCliente);
clienteRouter.put('/:id', validate(ClienteUpdateSchema),updateCliente);
clienteRouter.delete('/:id', deleteCliente);

export default clienteRouter;