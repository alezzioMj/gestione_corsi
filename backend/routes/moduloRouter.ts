import express from "express";
const moduloRouter = express.Router();
import { validate } from "../middlewares/validate";
import { moduloSchema } from "../validation/modulo.schema";
import multer from "multer";
import {
    getModuli,
    getModulo,
    createModulo,
    updateModulo,
    deleteModulo,
    getDocentiByModulo,
    getMaterialeByModulo,
    addMaterialeToModulo,
    deleteMaterialeFromModulo,
    getProgrammiByModulo,
    uploadCompleteModulo
} from '../controllers/moduloController';
const storage = multer.memoryStorage(); // <--- IMPORTANTE: salva in RAM temporaneamente
const upload = multer({ storage: storage });


moduloRouter.get('/', getModuli);
moduloRouter.get('/:id', getModulo);
moduloRouter.post('/', validate(moduloSchema), createModulo);
moduloRouter.put('/:id', validate(moduloSchema), updateModulo);
moduloRouter.delete('/:id', deleteModulo);

//DOCENTI
moduloRouter.get('/:id/docenti', getDocentiByModulo);

//MATERIALI
moduloRouter.get('/:id/materiali', getMaterialeByModulo);
moduloRouter.post('/:id/materiali', addMaterialeToModulo);
moduloRouter.delete('/:id/materiali/:materiale_id', deleteMaterialeFromModulo);
moduloRouter.post('/completo', upload.single('file'), uploadCompleteModulo);

//PROGRAMMI
moduloRouter.get('/:id/programmi', getProgrammiByModulo);

export default moduloRouter;