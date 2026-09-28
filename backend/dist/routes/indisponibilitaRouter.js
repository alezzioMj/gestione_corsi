"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const indisponibilitaRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const indisponibilita_schema_1 = require("@shared/validation/indisponibilita.schema");
const indisponibilitaController_1 = require("../controllers/indisponibilitaController");
indisponibilitaRouter.get('/', indisponibilitaController_1.getIndisponibilita);
indisponibilitaRouter.get('/:id', indisponibilitaController_1.getIndisponibilitaById);
indisponibilitaRouter.post('/', (0, validate_1.validate)(indisponibilita_schema_1.indisponibilitaSchema), indisponibilitaController_1.createIndisponibilita);
indisponibilitaRouter.put('/:id', (0, validate_1.validate)(indisponibilita_schema_1.indisponibilitaSchema), indisponibilitaController_1.updateIndisponibilita);
indisponibilitaRouter.delete('/:id', indisponibilitaController_1.deleteIndisponibilita);
exports.default = indisponibilitaRouter;
