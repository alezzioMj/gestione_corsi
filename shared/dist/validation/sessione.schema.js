"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessioneSchema = void 0;
const zod_1 = require("zod");
exports.sessioneSchema = zod_1.z.object({
    corso_id: zod_1.z.number().int().positive(),
    docente_cf: zod_1.z.string().length(16),
    modulo_id: zod_1.z.number().int().positive(),
    sede_id: zod_1.z.number().int().positive(),
    aula_id: zod_1.z.number().int().positive(),
    data: zod_1.z.coerce.date(),
    ora_inizio: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    ora_fine: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    stato: zod_1.z.enum(["Bozza", "Confermata", "Annullata"]).default("Bozza"),
    priorita: zod_1.z.number().int().min(0),
    note: zod_1.z.string().optional().nullable(),
    created_by: zod_1.z.string().max(100).optional().nullable(),
})
    .refine((data) => data.ora_fine > data.ora_inizio, {
    message: "ora_fine deve essere successiva a ora_inizio",
    path: ["ora_fine"],
});
