"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sediRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const sede_schema_1 = require("../validation/sede.schema");
const sedeController_1 = require("../controllers/sedeController");
sediRouter.get('/', sedeController_1.getSedi);
sediRouter.get('/:id', sedeController_1.getSede);
sediRouter.post('/', (0, validate_1.validate)(sede_schema_1.sedeSchema), sedeController_1.createSede);
sediRouter.put('/:id', (0, validate_1.validate)(sede_schema_1.sedeSchema), sedeController_1.updateSede);
sediRouter.delete('/:id', sedeController_1.deleteSede);
//CORSI
sediRouter.get('/:id/corsi', sedeController_1.getCorsiBySede);
exports.default = sediRouter;
