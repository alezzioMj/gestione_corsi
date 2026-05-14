"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const materialeRouter = express_1.default.Router();
const validate_1 = require("../middlewares/validate");
const multer_1 = __importDefault(require("multer")); // Importa multer
const materiale_schema_1 = require("../validation/materiale.schema");
const materialeController_1 = require("../controllers/materialeController");
// Configurazione di Multer per l'archiviazione dei file
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Specifica la cartella dove salvare i file. Assicurati che esista!
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Genera un nome file unico per evitare sovrascritture
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
materialeRouter.get('/', materialeController_1.getMateriali);
materialeRouter.get('/:id', materialeController_1.getMateriale);
materialeRouter.post('/', (0, validate_1.validate)(materiale_schema_1.materialeSchema), materialeController_1.createMateriale);
materialeRouter.put('/:id', (0, validate_1.validate)(materiale_schema_1.materialeSchema), materialeController_1.updateMateriale);
materialeRouter.delete('/:id', materialeController_1.deleteMateriale);
materialeRouter.post('/upload', upload.single('file'), materialeController_1.uploadFileAndCreateMateriale); // Nuova rotta per l'upload con Multer
//MODULI
materialeRouter.get('/:id/moduli', materialeController_1.getModuliByMateriale);
exports.default = materialeRouter;
