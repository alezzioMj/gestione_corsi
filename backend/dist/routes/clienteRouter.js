"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clienteRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const clientiController_1 = require("../controllers/clientiController");
const types_1 = require("@progetto/shared/validation/types");
clienteRouter.get('/', clientiController_1.getClienti);
clienteRouter.post('/', (0, validate_1.validate)(types_1.ClienteUpdateSchema), clientiController_1.createCliente);
clienteRouter.put('/:id', (0, validate_1.validate)(types_1.ClienteUpdateSchema), clientiController_1.updateCliente);
clienteRouter.delete('/:id', clientiController_1.deleteCliente);
exports.default = clienteRouter;
