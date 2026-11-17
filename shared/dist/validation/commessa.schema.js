"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommessaSchema = exports.createCommessaSchema = exports.commessaSchema = exports.statiCommessa = void 0;
const zod_1 = require("zod");
exports.statiCommessa = [
    "APERTA",
    "IN_CORSO",
    "CHIUSA",
    "ANNULLATA"
];
exports.commessaSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    codice_commessa: zod_1.z.string().min(1).max(255),
    codice_ft: zod_1.z.string().max(255).nullable().optional(),
    codice_rlom: zod_1.z.string().max(255).nullable().optional(),
    descrizione: zod_1.z.string().nullable().optional(),
    scadenza: zod_1.z.coerce.date().nullable().optional(),
    cliente_id: zod_1.z.number().int().nullable().optional(), stato: zod_1.z.enum(exports.statiCommessa).optional(),
});
// Per la creazione l'id non c'è (autoincrement)
exports.createCommessaSchema = exports.commessaSchema.omit({ id: true });
// Per la modifica parziale
exports.updateCommessaSchema = exports.commessaSchema.omit({ id: true }).partial();
