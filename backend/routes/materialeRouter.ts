import express from "express";
const materialeRouter = express.Router();
import { validate } from "../middlewares/validate";
import multer from 'multer'; // Importa multer
import path from 'path'; // Importa path per la gestione dei nomi dei file
import { materialeSchema } from "../validation/materiale.schema";
import {
    getMateriali,
    getMateriale,
    createMateriale,
    updateMateriale,
    deleteMateriale,
    getModuliByMateriale,
    uploadFileAndCreateMateriale // Assicurati che sia esportata dal controller
} from '../controllers/materialeController';

// Configurazione di Multer per l'archiviazione dei file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specifica la cartella dove salvare i file. Assicurati che esista!
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Genera un nome file unico per evitare sovrascritture
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

materialeRouter.get('/', getMateriali);
materialeRouter.get('/:id', getMateriale);
materialeRouter.post('/', validate(materialeSchema), createMateriale);
materialeRouter.put('/:id', validate(materialeSchema), updateMateriale);
materialeRouter.delete('/:id', deleteMateriale);
materialeRouter.post('/upload', upload.single('file'), uploadFileAndCreateMateriale); // Nuova rotta per l'upload con Multer

//MODULI
materialeRouter.get('/:id/moduli', getModuliByMateriale);

export default materialeRouter;