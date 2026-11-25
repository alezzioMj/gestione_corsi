"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClienteSchema = exports.createClienteSchema = exports.clienteSchema = void 0;
const zod_1 = require("zod");
const agente_schema_1 = require("./agente.schema");
const contatto_schema_1 = require("./contatto.schema");
const sedecliente_schema_1 = require("./sedecliente.schema");
exports.clienteSchema = zod_1.z.object({
    id: zod_1.z.number(),
    ragione_sociale: zod_1.z.string().min(1),
    partita_iva: zod_1.z.string().min(1),
    agente_id: zod_1.z.number().nullable(), // agente_id Int? nel modello Prisma
});
// ---- contatti ----
const contattoNuovoSchema = contatto_schema_1.contattoSchema.omit({ id: true, sede_id: true });
const contattoEsistenteSchema = contattoNuovoSchema
    .partial()
    .extend({ id: zod_1.z.number().int().positive() });
// ---- sedi ----
const sedeNuovaSchema = sedecliente_schema_1.sedeClienteSchema
    .omit({ id: true, cliente_id: true })
    .extend({
    tipo: zod_1.z.enum(sedecliente_schema_1.TIPI_SEDE_CLIENTE).default("OPERATIVA"),
    contatti: zod_1.z.array(contattoNuovoSchema).optional(),
});
const sedeEsistenteSchema = sedecliente_schema_1.sedeClienteSchema
    .omit({ id: true, cliente_id: true })
    .partial()
    .extend({
    id: zod_1.z.number().int().positive(),
    contatti: zod_1.z
        .array(zod_1.z.union([contattoEsistenteSchema, contattoNuovoSchema]))
        .optional(),
});
// ---- create: agente completo, con id se esiste già ----
exports.createClienteSchema = exports.clienteSchema
    .omit({ id: true, agente_id: true })
    .extend({
    agente: agente_schema_1.agenteInputSchema.optional(),
    sedi: zod_1.z.array(sedeNuovaSchema).optional(),
});
// ---- update: tutto opzionale, agente_id null = scollega ----
exports.updateClienteSchema = exports.clienteSchema
    .omit({ id: true })
    .partial()
    .extend({
    sedi: zod_1.z.array(zod_1.z.union([sedeEsistenteSchema, sedeNuovaSchema])).optional(),
});
