import { number, z } from "zod";
import { corsoSchema, corsoWithRelationsSchema } from "./corso.schema";
import { docenteSchema } from "./docente.schema";
import { moduloSchema } from "./modulo.schema";
import { aulaSchema } from "./aula.schema";
import { sedeSchema } from "./sede.schema";

export const sessioneSchema = z.object({
  id: z.number(),
  corso_id: z.number().int().positive(),
  docente_cf: z.string().length(16),

  modulo_id: z.number().int().positive(),
  sede_id: z.number().int().positive(),
  aula_id: z.number().int().positive(),

  data: z.coerce.date(),

  ora_inizio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  ora_fine: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),

  stato: z.enum(["Bozza", "Confermata", "Annullata"]).default("Bozza"),

  priorita: z.number().int().min(0),

  note: z.string().optional().nullable(),

  created_at: z.coerce.date(),
  created_by: z.string().max(100).optional().nullable(),
})

export const sessioneWithRelationsSchema = sessioneSchema.extend(
  {
    corso: corsoWithRelationsSchema,
    docente: docenteSchema,
    modulo: moduloSchema,
    aula: aulaSchema,
    sede: sedeSchema,
  }
)

const orarioValido = (d: { ora_inizio?: string; ora_fine?: string }) =>
  !d.ora_inizio || !d.ora_fine || d.ora_fine > d.ora_inizio;
const orarioMsg = { message: "ora_fine deve essere successiva a ora_inizio", path: ["ora_fine"] };

export const createSessioneSchema = sessioneSchema.omit({ id: true, created_at: true }).refine(orarioValido, orarioMsg);
export const updateSessioneSchema = sessioneSchema.partial().refine(orarioValido, orarioMsg);


export type Sessione = z.infer<typeof sessioneSchema>
export type SessioneWithRelations = z.infer<typeof sessioneWithRelationsSchema>
export type CreateSessione = z.infer<typeof createSessioneSchema>
export type UpdateSessione = z.infer<typeof updateSessioneSchema>