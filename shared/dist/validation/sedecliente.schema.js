"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSedeClienteSchema = exports.createSedeClienteSchema = exports.SedeClienteWithRelationsSchema = exports.sedeClienteSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const contatto_schema_1 = require("./contatto.schema");
exports.sedeClienteSchema = zod_1.default.object({
    id: zod_1.default.number(),
    tipo: zod_1.default.enum([
        "LEGALE",
        "OPERATIVA"
    ]),
    cliente_id: zod_1.default.number(),
    nome: zod_1.default.string(),
    indirizzo: zod_1.default.string(),
    civico: zod_1.default.string(),
    cap: zod_1.default.string(),
    citta: zod_1.default.string(),
    provincia: zod_1.default.string()
});
exports.SedeClienteWithRelationsSchema = exports.sedeClienteSchema.extend({
    contatti: zod_1.default.array(contatto_schema_1.contattoSchema),
});
exports.createSedeClienteSchema = exports.sedeClienteSchema.omit({ id: true });
exports.updateSedeClienteSchema = exports.sedeClienteSchema.partial().required({ id: true });
