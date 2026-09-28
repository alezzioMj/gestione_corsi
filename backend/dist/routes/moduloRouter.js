"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const moduloRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const modulo_schema_1 = require("@shared/validation/modulo.schema");
const multer_1 = __importDefault(require("multer"));
const moduloController_1 = require("../controllers/moduloController");
const storage = multer_1.default.memoryStorage(); // <--- IMPORTANTE: salva in RAM temporaneamente
const upload = (0, multer_1.default)({ storage: storage });
moduloRouter.get('/', moduloController_1.getModuli);
moduloRouter.get('/:id', moduloController_1.getModulo);
moduloRouter.post('/', upload.none(), (0, validate_1.validate)(modulo_schema_1.moduloSchema), moduloController_1.createModulo);
moduloRouter.put('/:id', upload.none(), (0, validate_1.validate)(modulo_schema_1.moduloSchema), moduloController_1.updateModulo);
moduloRouter.delete('/:id', moduloController_1.deleteModulo);
//DOCENTI
moduloRouter.get('/:id/docenti', moduloController_1.getDocentiByModulo);
//MATERIALI
moduloRouter.get('/:id/materiali', moduloController_1.getMaterialeByModulo);
moduloRouter.post('/:id/materiali', moduloController_1.addMaterialeToModulo);
moduloRouter.delete('/:id/materiali/:materiale_id', moduloController_1.deleteMaterialeFromModulo);
moduloRouter.post('/completo', upload.single('file'), moduloController_1.uploadCompleteModulo);
//PROGRAMMI
moduloRouter.get('/:id/programmi', moduloController_1.getProgrammiByModulo);
exports.default = moduloRouter;
