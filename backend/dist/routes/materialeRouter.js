"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const materialeRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const multer_1 = __importDefault(require("multer"));
const materiale_schema_1 = require("@progetto/shared/validation/materiale.schema");
const materialeController_1 = require("../controllers/materialeController");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
materialeRouter.get('/', materialeController_1.getMateriali);
materialeRouter.get('/:id', materialeController_1.getMateriale);
materialeRouter.post("/", upload.single("file"), materialeController_1.createMateriale);
materialeRouter.put('/:id', upload.single('file'), (0, validate_1.validate)(materiale_schema_1.materialeSchema), materialeController_1.updateMateriale);
materialeRouter.delete('/:id', materialeController_1.deleteMateriale);
//MODULI
materialeRouter.get('/:id/moduli', materialeController_1.getModuliByMateriale);
exports.default = materialeRouter;
