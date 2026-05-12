"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const corsiRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const corso_schema_1 = require("../validation/corso.schema");
const corsoController_1 = require("../controllers/corsoController");
const scheduleCorsoController_1 = require("../controllers/scheduleCorsoController");
corsiRouter.get("/", corsoController_1.getCorsi);
corsiRouter.get("/:id", corsoController_1.getCorso);
corsiRouter.post("/", (0, validate_1.validate)(corso_schema_1.corsoSchema), corsoController_1.createCorso);
corsiRouter.put("/:id", (0, validate_1.validate)(corso_schema_1.corsoSchema), corsoController_1.updateCorso);
corsiRouter.delete("/:id", corsoController_1.deleteCorso);
// DOCENTI
corsiRouter.get("/:id/docenti", corsoController_1.getDocenti);
corsiRouter.post("/:id/docenti", corsoController_1.addDocenteToCorso);
corsiRouter.delete("/:id/docenti/:docente_cf", corsoController_1.deleteDocenteFromCorso);
// SEDI
corsiRouter.get("/:id/sedi", corsoController_1.getSediByCorso);
corsiRouter.post("/:id/sedi", corsoController_1.addSedeToCorso);
corsiRouter.delete("/:id/sedi/:sede_id", corsoController_1.deleteSedeFromCorso);
//SCHEDULAZIONE
corsiRouter.post("/:id/schedule", scheduleCorsoController_1.scheduleCorsoController);
exports.default = corsiRouter;
