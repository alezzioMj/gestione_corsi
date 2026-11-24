"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClienteSchema = exports.createClienteSchema = exports.clienteWithRelationsSchema = exports.clienteSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const sedecliente_schema_1 = require("./sedecliente.schema");
exports.clienteSchema = zod_1.default.object({
    id: zod_1.default.number(),
    ragione_sociale: zod_1.default.string(),
    partita_iva: zod_1.default.string(),
    agente_id: zod_1.default.number(),
});
exports.clienteWithRelationsSchema = exports.clienteSchema.extend({
    sedi: zod_1.default.array(sedecliente_schema_1.SedeClienteWithRelationsSchema),
});
exports.createClienteSchema = exports.clienteWithRelationsSchema.omit({
    id: true,
    agente_id: true
}).extend({
    sedi: zod_1.default.array(exports.clienteWithRelationsSchema.shape.sedi.element.omit({
        cliente_id: true,
        id: true
    }).extend({
        id: zod_1.default.number().int().positive().optional(),
        contatti: zod_1.default.array(exports.clienteWithRelationsSchema.shape.sedi.element.shape.contatti.element
            .omit({
            sede_id: true,
            id: true
        })
            .extend({
            id: zod_1.default.number().int().positive().optional()
        }))
    }))
});
exports.updateClienteSchema = exports.clienteWithRelationsSchema
    .omit({
    agente_id: true
})
    .partial()
    .extend({
    id: zod_1.default.number().int().positive(),
    sedi: exports.clienteWithRelationsSchema.shape.sedi
        .element
        .partial()
        .extend({
        id: zod_1.default.number().int().positive(),
        contatti: zod_1.default.array(exports.clienteWithRelationsSchema.shape.sedi.element.shape.contatti.element
            .partial()
            .extend({
            id: zod_1.default.number().int().positive()
        })).optional()
    })
        .array()
        .optional()
});
