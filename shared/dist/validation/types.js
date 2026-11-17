"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiErrorSchema = void 0;
const zod_1 = require("zod");
exports.apiErrorSchema = zod_1.z.object({
    error: zod_1.z.string().optional(),
    issues: zod_1.z.array(zod_1.z.object({
        message: zod_1.z.string(),
        path: zod_1.z.array(zod_1.z.string()).optional(),
    })).optional(),
});
