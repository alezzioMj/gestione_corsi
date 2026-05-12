"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aulaRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const aula_schema_1 = require("../validation/aula.schema");
const aulaController_1 = require("../controllers/aulaController");
aulaRouter.get('/', aulaController_1.getAule);
aulaRouter.get('/:id', aulaController_1.getAula);
aulaRouter.post('/', (0, validate_1.validate)(aula_schema_1.aulaSchema), aulaController_1.createAula);
aulaRouter.put('/:id', (0, validate_1.validate)(aula_schema_1.aulaSchema), aulaController_1.updateAula);
aulaRouter.delete('/:id', aulaController_1.deleteAula);
exports.default = aulaRouter;
