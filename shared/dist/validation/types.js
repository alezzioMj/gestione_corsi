"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessioneWithRelations = exports.ClienteUpdateSchema = exports.ClienteWithRelations = exports.SedeWithRelations = exports.apiErrorSchema = exports.sessioneDbSchema = exports.moduloDbSchema = exports.sedeDbSchema = exports.docenteDbSchema = exports.aulaDbSchema = exports.programmaDbSchema = exports.corsoDbSchema = void 0;
// c:\Users\aless\Desktop\gestione_corsi\backend\src\types.ts
const corso_schema_1 = require("../validation/corso.schema");
const aula_schema_1 = require("../validation/aula.schema");
const docente_schema_1 = require("../validation/docente.schema");
const sede_schema_1 = require("../validation/sede.schema");
const programma_schema_1 = require("./programma.schema");
const zod_1 = require("zod");
const modulo_schema_1 = require("./modulo.schema");
const sessione_schema_1 = require("./sessione.schema");
const cliente_schema_1 = require("./cliente.schema");
const sedecliente_schema_1 = require("./sedecliente.schema");
const contatto_schema_1 = require("./contatto.schema");
// Schema esteso per il FETCH (Dati che arrivano dal Database)
exports.corsoDbSchema = corso_schema_1.corsoSchema.extend({
    id: zod_1.z.number(),
    createdAt: zod_1.z.date().optional()
});
exports.programmaDbSchema = programma_schema_1.programmaSchema.extend({
    id: zod_1.z.number(),
    createdAt: zod_1.z.date().optional()
});
exports.aulaDbSchema = aula_schema_1.aulaSchema.extend({
    id: zod_1.z.number(),
    createdAt: zod_1.z.date().optional(),
});
exports.docenteDbSchema = docente_schema_1.docenteSchema.extend({
    // Se il docente usa il CF come ID, non serve aggiungere id: z.number()
    createdAt: zod_1.z.date().optional()
});
exports.sedeDbSchema = sede_schema_1.sedeSchema.extend({
    id: zod_1.z.number(),
    createdAt: zod_1.z.date().optional(),
});
exports.moduloDbSchema = modulo_schema_1.moduloSchema.extend({
    id: zod_1.z.number(),
    createdAt: zod_1.z.date().optional()
});
exports.sessioneDbSchema = sessione_schema_1.sessioneSchema.extend({
    id: zod_1.z.number().int().positive()
});
// Forma delle risposte di errore dalle API
exports.apiErrorSchema = zod_1.z.object({
    error: zod_1.z.string().optional(),
    issues: zod_1.z.array(zod_1.z.object({
        message: zod_1.z.string(),
        path: zod_1.z.array(zod_1.z.string()).optional(),
    })).optional(),
});
exports.SedeWithRelations = sedecliente_schema_1.sedeClienteSchema.extend({
    contatti: zod_1.z.array(contatto_schema_1.contattoSchema),
});
exports.ClienteWithRelations = cliente_schema_1.clienteSchema.extend({
    sedi: zod_1.z.array(exports.SedeWithRelations),
});
exports.ClienteUpdateSchema = exports.ClienteWithRelations.omit({
    id: true,
    agente_id: true
}).extend({
    sedi: zod_1.z.array(exports.ClienteWithRelations.shape.sedi.element.omit({
        cliente_id: true,
        id: true
    }).extend({
        id: zod_1.z.number().int().positive().optional(),
        contatti: zod_1.z.array(exports.ClienteWithRelations.shape.sedi.element.shape.contatti.element
            .omit({
            sede_id: true,
            id: true
        })
            .extend({
            id: zod_1.z.number().int().positive().optional()
        }))
    }))
});
exports.SessioneWithRelations = exports.sessioneDbSchema.extend({
    corso: exports.corsoDbSchema,
    docente: exports.docenteDbSchema,
    modulo: modulo_schema_1.moduloSchema,
    aula: exports.aulaDbSchema,
    sede: exports.sedeDbSchema,
});
