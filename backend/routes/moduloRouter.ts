import express from "express";
const moduloRouter = express.Router();
import { validate } from "../middlewares/validate";
import { moduloSchema } from "../validation/modulo.schema";
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
    getProgrammiByModulo
} from '../controllers/moduloController';


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

//PROGRAMMI
moduloRouter.get('/:id/programmi', getProgrammiByModulo);

export default moduloRouter;