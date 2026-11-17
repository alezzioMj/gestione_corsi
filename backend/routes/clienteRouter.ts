import express from "express";
const clienteRouter= express.Router();
import { validate } from "../middlewares/validate";
import { aulaSchema } from "@progetto/shared/validation/aula.schema";
import { createCliente, deleteCliente, getClienti, updateCliente } from "../controllers/clientiController";
import { createClienteSchema, updateClienteSchema } from "@progetto/shared/validation/cliente.schema";

clienteRouter.get('/', getClienti);
clienteRouter.post('/', validate(createClienteSchema), createCliente);
clienteRouter.put('/:id', validate(createClienteSchema), updateCliente);
clienteRouter.delete('/:id', deleteCliente);

export default clienteRouter;