import express from "express";
const clienteRouter= express.Router();
import { validate } from "../middlewares/validate";
import { aulaSchema } from "@progetto/shared/validation/aula.schema";
import { createCliente, getClienti } from "../controllers/clientiController";

clienteRouter.get('/', getClienti);
clienteRouter.post('/', createCliente);

export default clienteRouter;