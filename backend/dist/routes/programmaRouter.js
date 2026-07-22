"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const programmaRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const programma_schema_1 = require("../validation/programma.schema");
const programmaController_1 = require("../controllers/programmaController");
programmaRouter.get('/', programmaController_1.getProgrammi);
programmaRouter.get('/:id', programmaController_1.getProgramma);
programmaRouter.post('/', (0, validate_1.validate)(programma_schema_1.programmaSchema), programmaController_1.createProgramma);
programmaRouter.put('/:id', (0, validate_1.validate)(programma_schema_1.programmaSchema), programmaController_1.updateProgramma);
programmaRouter.delete('/:id', programmaController_1.deleteProgramma);
//MODULI
programmaRouter.get("/:id/moduli", programmaController_1.getModuliByProgramma);
programmaRouter.post("/:id/moduli", programmaController_1.addModuloToProgramma);
programmaRouter.post("/:id/moduli_bulk", programmaController_1.addModuloToProgrammaBulk);
programmaRouter.delete("/:id/moduli/:modulo_id", programmaController_1.deleteModuloFromProgramma);
programmaRouter.post("/completo", programmaController_1.createCompleteProgramma);
exports.default = programmaRouter;
