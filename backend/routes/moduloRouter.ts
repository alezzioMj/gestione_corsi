import express from "express";
const moduloRouter = express.Router();
import { validate } from "../middlewares/validate";
import { createModuloSchema, moduloSchema, updateModuloSchema } from "@progetto/shared/validation/modulo.schema";
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
    uploadMaterialeToModulo
} from '../controllers/moduloController';
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

moduloRouter.get('/', getModuli);
moduloRouter.get('/:id', getModulo);
moduloRouter.post('/', upload.none(), validate(createModuloSchema), createModulo);
moduloRouter.put('/:id', upload.none(), validate(updateModuloSchema), updateModulo);
moduloRouter.delete('/:id', deleteModulo);

//DOCENTI
moduloRouter.get('/:id/docenti', getDocentiByModulo);

//MATERIALI
moduloRouter.get('/:id/materiali', getMaterialeByModulo);
moduloRouter.post('/:id/materiali', addMaterialeToModulo);
moduloRouter.delete('/:id/materiali/:materiale_id', deleteMaterialeFromModulo);
moduloRouter.post('/:id/completo', upload.single('file'), uploadMaterialeToModulo);

//PROGRAMMI
moduloRouter.get('/:id/programmi', getProgrammiByModulo);

export default moduloRouter;