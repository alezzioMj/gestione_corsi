"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsoSchema = void 0;
const zod_1 = require("zod");
exports.corsoSchema = zod_1.z.object({
    cliente: zod_1.z.string().max(150),
    programma_id: zod_1.z.number(),
    n_ore: zod_1.z.number(),
    nome: zod_1.z.string().max(150),
    inizio: zod_1.z.coerce.date(),
    fine: zod_1.z.coerce.date(),
    //orari di inizio e fine
    mattina_inizio: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    mattina_fine: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    pomeriggio_inizio: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    pomeriggio_fine: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
})
    //Validazione date e orari
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
