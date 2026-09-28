"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sessioneRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const sessione_schema_1 = require("@shared/validation/sessione.schema");
const sessioneController_1 = require("../controllers/sessioneController");
sessioneRouter.get('/', sessioneController_1.getSessioni);
sessioneRouter.get("/full", sessioneController_1.getSessioniFull);
sessioneRouter.get('/:id', sessioneController_1.getSessione);
sessioneRouter.post('/', (0, validate_1.validate)(sessione_schema_1.sessioneSchema), sessioneController_1.createSessione);
sessioneRouter.put('/:id', (0, validate_1.validate)(sessione_schema_1.sessioneSchema), sessioneController_1.updateSessione);
sessioneRouter.delete('/:id', sessioneController_1.deleteSessione);
exports.default = sessioneRouter;
