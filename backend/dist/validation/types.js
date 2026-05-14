"use strict";
// c:\Users\aless\Desktop\gestione_corsi\backend\src\types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.sedeDbSchema = exports.docenteDbSchema = exports.aulaDbSchema = exports.programmaDbSchema = exports.corsoDbSchema = void 0;
const corso_schema_1 = require("../validation/corso.schema");
const aula_schema_1 = require("../validation/aula.schema");
const docente_schema_1 = require("../validation/docente.schema");
const sede_schema_1 = require("../validation/sede.schema");
const programma_schema_1 = require("./programma.schema");
const zod_1 = require("zod");
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
