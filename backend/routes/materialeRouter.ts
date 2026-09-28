import express from "express";
const materialeRouter = express.Router();
import { validate } from "../middlewares/validate";
import multer from 'multer'; // Importa multer
import path from 'path'; // Importa path per la gestione dei nomi dei file
import { materialeSchema } from "@progetto/shared/validation/materiale.schema";
import {
    getMateriali,
    getMateriale,
    createMateriale,
    updateMateriale,
    deleteMateriale,
    getModuliByMateriale// Assicurati che sia esportata dal controller
} from '../controllers/materialeController';
const storage = multer.memoryStorage(); // <--- IMPORTANTE: salva in RAM temporaneamente
const upload = multer({ storage: storage });

// La tua rotta userà questo middleware
materialeRouter.get('/', getMateriali);
materialeRouter.get('/:id', getMateriale);
materialeRouter.post('/', validate(materialeSchema), createMateriale);
materialeRouter.put('/:id', validate(materialeSchema), updateMateriale);
materialeRouter.delete('/:id', deleteMateriale); // Nuova rotta per l'upload con Multer

//MODULI
materialeRouter.get('/:id/moduli', getModuliByMateriale);

export default materialeRouter;