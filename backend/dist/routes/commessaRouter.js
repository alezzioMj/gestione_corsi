"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commessaRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const commessa_schema_1 = require("@progetto/shared/validation/commessa.schema");
const commessaController_1 = require("../controllers/commessaController");
commessaRouter.get('/', commessaController_1.getCommesse);
commessaRouter.post('/', (0, validate_1.validate)(commessa_schema_1.createCommessaSchema), commessaController_1.createCommessa);
commessaRouter.put('/:id', (0, validate_1.validate)(commessa_schema_1.updateCommessaSchema), commessaController_1.updateCommessa);
commessaRouter.delete('/:id', commessaController_1.deleteCommessa);
exports.default = commessaRouter;
