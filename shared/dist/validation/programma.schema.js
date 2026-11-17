"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProgrammaSchema = exports.createProgrammaSchema = exports.programmaWithRelationsSchema = exports.programmaSchema = void 0;
const zod_1 = require("zod");
const modulo_schema_1 = require("./modulo.schema");
exports.programmaSchema = zod_1.z.object({
    id: zod_1.z.number(),
    titolo: zod_1.z.string().min(1).max(150),
    descrizione: zod_1.z.string().optional(),
    durata_totale: zod_1.z.number().int().positive(),
    ore_pratiche: zod_1.z.number().int().nonnegative(),
    ore_teoriche: zod_1.z.number().int().nonnegative(),
    ore_trasversali: zod_1.z.number().int().nonnegative(),
    created_at: zod_1.z.coerce.date(),
    created_by: zod_1.z.string().max(100).optional(),
});
exports.programmaWithRelationsSchema = exports.programmaSchema.extend({
    moduli: zod_1.z.array(modulo_schema_1.moduloSchema)
});
exports.createProgrammaSchema = exports.programmaSchema.omit({
    id: true,
    created_at: true
});
exports.updateProgrammaSchema = exports.programmaSchema.partial().required({ id: true });
