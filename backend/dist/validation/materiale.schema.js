"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.materialeSchema = void 0;
const zod_1 = require("zod");
exports.materialeSchema = zod_1.z.object({
    url: zod_1.z.url("URL non valido").max(255),
    file_name: zod_1.z.string()
        .min(1, "Il nome file è obbligatorio")
        .max(255, "Nome file troppo lungo"),
    tipo: zod_1.z.string()
        .min(1, "Il tipo è obbligatorio")
        .max(50, "Tipo troppo lungo"),
    descrizione: zod_1.z.string().optional(),
    created_by: zod_1.z.string()
        .max(100, "created_by troppo lungo")
        .optional(),
});
