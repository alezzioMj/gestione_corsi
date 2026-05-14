"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aulaSchema = void 0;
const zod_1 = require("zod");
exports.aulaSchema = zod_1.z.object({
    nome: zod_1.z.string().max(100),
    sede_id: zod_1.z.number(),
    capienza: zod_1.z.number()
});
