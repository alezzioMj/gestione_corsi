import express from "express";
const materialeRouter = express.Router();
import { validate } from "../middlewares/validate";
import multer from 'multer'; 
import path from 'path'; 
import { materialeSchema } from "@progetto/shared/validation/materiale.schema";
import {
    getMateriali,
    getMateriale,
    createMateriale,
    updateMateriale,
    deleteMateriale,
    getModuliByMateriale
} from '../controllers/materialeController';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

materialeRouter.get('/', getMateriali);
materialeRouter.get('/:id', getMateriale);
materialeRouter.post("/", upload.single("file"), createMateriale);
materialeRouter.put('/:id', upload.single('file'), validate(materialeSchema), updateMateriale);
materialeRouter.delete('/:id', deleteMateriale);

//MODULI
materialeRouter.get('/:id/moduli', getModuliByMateriale);

export default materialeRouter;