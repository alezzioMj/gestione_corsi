"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orarioSchema = void 0;
const zod_1 = require("zod");
exports.orarioSchema = zod_1.z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Orario non valido (HH:mm)");
