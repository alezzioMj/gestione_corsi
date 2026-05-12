"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const docenteRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const docente_schema_1 = require("../validation/docente.schema");
const docenteController_1 = require("../controllers/docenteController");
docenteRouter.get('/', docenteController_1.getDocenti);
docenteRouter.get('/:codice_fiscale', docenteController_1.getDocente);
docenteRouter.post('/', (0, validate_1.validate)(docente_schema_1.docenteSchema), docenteController_1.createDocente);
docenteRouter.put('/:codice_fiscale', (0, validate_1.validate)(docente_schema_1.docenteSchema), docenteController_1.updateDocente);
docenteRouter.delete('/:codice_fiscale', docenteController_1.deleteDocente);
//CORSI
docenteRouter.get('/:codice_fiscale/corsi', docenteController_1.getCorsiByDocente);
//MODULI
docenteRouter.get('/:codice_fiscale/moduli', docenteController_1.getModuliByDocente);
docenteRouter.post('/:codice_fiscale/moduli', docenteController_1.addModuloToDocente);
docenteRouter.post('/:codice_fiscale/moduli_bulk', docenteController_1.addModuliToDocenteBulk);
docenteRouter.delete('/:codice_fiscale/moduli/:modulo_id', docenteController_1.deleteModuloFromDocente);
exports.default = docenteRouter;
