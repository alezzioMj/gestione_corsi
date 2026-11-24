"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommessaSchema = exports.createCommessaSchema = exports.commessaSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.commessaSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    codice_commessa: zod_1.z.string().min(1).max(255),
    codice_ft: zod_1.z.string().max(255).nullable().optional(),
    codice_rlom: zod_1.z.string().max(255).nullable().optional(),
    descrizione: zod_1.z.string().nullable().optional(),
    scadenza: zod_1.z.coerce.date().nullable().optional(),
    cliente_id: zod_1.z.number().int().nullable().optional(),
    stato: zod_1.z.enum(client_1.stato_commessa).optional(), // default APERTA lato DB
});
exports.createCommessaSchema = exports.commessaSchema.omit({ id: true });
exports.updateCommessaSchema = exports.commessaSchema.omit({ id: true }).partial();
