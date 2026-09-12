import { z } from "zod";

export const aulaSchema = z.object({
    nome : z.string().max(100),
    sede_id : z.number(),
    capienza : z.number(),
    descrizione : z.string().optional()
});

