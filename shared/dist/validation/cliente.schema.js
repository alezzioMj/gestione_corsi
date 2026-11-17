"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clienteSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.clienteSchema = zod_1.default.object({
    id: zod_1.default.number(),
    ragione_sociale: zod_1.default.string(),
    partita_iva: zod_1.default.string(),
    agente_id: zod_1.default.number(),
});
