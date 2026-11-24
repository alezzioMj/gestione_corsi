import { z } from "zod";
import { orarioSchema } from "./common.schema";
import type { Aula } from "./aula.schema";
import type { CorsoWithRelations } from "./corso.schema";
import type { Docente } from "./docente.schema";
import type { Modulo } from "./modulo.schema";
import type { Sede } from "./sede.schema";

export const STATI_SESSIONE = ["Bozza", "Confermata", "Annullata", "Completata"] as const;
export type StatoSessione = (typeof STATI_SESSIONE)[number];

export const sessioneSchema = z.object({
    id: z.number(),
    corso_id: z.number().int().positive(),
    docente_cf: z.string().length(16).nullable(), // docente_cf String? nel modello Prisma
    modulo_id: z.number().int().positive(),
    sede_id: z.number().int().positive(),
    aula_id: z.number().int().positive().nullable(), // aula_id Int? nel modello Prisma
    data: z.coerce.date(),
    ora_inizio: orarioSchema,
    ora_fine: orarioSchema,
    stato: z.enum(STATI_SESSIONE).nullable(), // stato Enum? @default(Bozza) nel modello Prisma
    priorita: z.number().int().min(0),
    note: z.string().nullish(),
    created_at: z.coerce.date(),
    created_by: z.string().max(100).nullable(),
});

const orarioValido = (d: { ora_inizio?: string; ora_fine?: string }) =>
    !d.ora_inizio || !d.ora_fine || d.ora_fine > d.ora_inizio;
const orarioMsg = { message: "ora_fine deve essere successiva a ora_inizio", path: ["ora_fine"] };

// Base degli input: docente e aula facoltativi, stato obbligatorio solo se presente
const sessioneInputSchema = sessioneSchema
    .omit({ id: true, created_at: true, created_by: true })
    .extend({
        docente_cf: z.string().length(16).nullish(),
        aula_id: z.number().int().positive().nullish(),
        stato: z.enum(STATI_SESSIONE),
    });

// Il default sta solo in create: nel partial() di update si riapplicherebbe (Zod 4)
// e ogni modifica riporterebbe la sessione a "Bozza".
export const createSessioneSchema = sessioneInputSchema
    .extend({ stato: z.enum(STATI_SESSIONE).default("Bozza") })
    .refine(orarioValido, orarioMsg);

export const updateSessioneSchema = sessioneInputSchema
    .partial()
    .refine(orarioValido, orarioMsg);

// Assunzione: il corso arriva con le sue relazioni, come prima (corsoWithRelationsSchema).
// Se getSessioniFullService ne include meno, riduci le chiavi del generic.
type SessioneRelations = {
    corso: CorsoWithRelations<"programma" | "commessa" | "corso_docente" | "corso_sede">;
    docente: Docente | null;
    modulo: Modulo;
    aula: Aula | null;
    sede: Sede;
};

export type SessioneWithRelations<K extends keyof SessioneRelations = never> =
    Sessione & Pick<SessioneRelations, K>;

export type Sessione = z.infer<typeof sessioneSchema>;
export type CreateSessione = z.infer<typeof createSessioneSchema>;
export type UpdateSessione = z.infer<typeof updateSessioneSchema>;
