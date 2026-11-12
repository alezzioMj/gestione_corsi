"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.programmaSchema = void 0;
const zod_1 = require("zod");
exports.programmaSchema = zod_1.z.object({
    titolo: zod_1.z.string().min(1).max(150),
    descrizione: zod_1.z.string().optional(),
    durata_totale: zod_1.z.number().int().positive(),
    ore_pratiche: zod_1.z.number().int().nonnegative(),
    ore_teoriche: zod_1.z.number().int().nonnegative(),
    ore_trasversali: zod_1.z.number().int().nonnegative(),
    created_by: zod_1.z.string().max(100).optional(),
});
