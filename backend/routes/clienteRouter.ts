import express from "express";
const clienteRouter= express.Router();
import { validate } from "../middlewares/validate";
import { aulaSchema } from "@progetto/shared/validation/aula.schema";
import { createCliente } from "../controllers/clientiController";

clienteRouter.post('/', createCliente);

export default clienteRouter;