"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCorsoSchema = exports.createCorsoSchema = exports.corsoWithRelationsSchema = exports.corsoSchema = void 0;
const zod_1 = require("zod");
const commessa_schema_1 = require("./commessa.schema");
const programma_schema_1 = require("./programma.schema");
exports.corsoSchema = zod_1.z.object({
    id: zod_1.z.number(),
    commessa_id: zod_1.z.number(),
    programma_id: zod_1.z.number(),
    n_ore: zod_1.z.number(),
    nome: zod_1.z.string().max(150),
    inizio: zod_1.z.coerce.date(),
    fine: zod_1.z.coerce.date(),
    mattina_inizio: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    mattina_fine: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    pomeriggio_inizio: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    pomeriggio_fine: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    created_at: zod_1.z.coerce.date()
})
    .refine((data) => data.fine >= data.inizio, {
    message: "La data fine deve essere successiva o uguale alla data inizio",
    path: ["fine"],
})
    .refine((data) => data.mattina_fine > data.mattina_inizio, {
    message: "L'orario di fine mattina deve essere successivo all'inizio",
    path: ["mattina_fine"],
})
    .refine((data) => data.pomeriggio_fine > data.pomeriggio_inizio, {
    message: "L'orario di fine pomeriggio deve essere successivo all'inizio",
    path: ["pomeriggio_fine"],
});
exports.corsoWithRelationsSchema = exports.corsoSchema.extend({
    commessa: commessa_schema_1.commessaSchema,
    programma: programma_schema_1.programmaSchema
});
exports.createCorsoSchema = exports.corsoSchema.omit({
    id: true,
    created_at: true,
});
exports.updateCorsoSchema = exports.corsoSchema.partial().required({ id: true });
