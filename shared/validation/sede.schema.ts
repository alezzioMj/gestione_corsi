import { z } from "zod";
import type { Aula } from "./aula.schema";
import type { CorsoSedeWithRelations } from "./corso.schema";

export const sedeSchema = z.object({
    id: z.number(),
    nome: z.string().min(1).max(150),
    indirizzo: z.string().min(1).max(150),
    civico: z.string().min(1).max(20),
    cap: z.string().regex(/^\d{5}$/, "CAP non valido"),
    citta: z.string().min(1).max(100),
    provincia: z.string().length(2),
    descrizione: z.string().nullish(),
    created_at: z.coerce.date(),
    created_by: z.string().max(100).nullable(),
});

export const createSedeSchema = sedeSchema.omit({
    id: true,
    created_at: true,
    created_by: true,
});

export const updateSedeSchema = createSedeSchema.partial();

// Allineato a INCLUDE_MAP di sedeController. Il nome della relazione è `aula`, come in Prisma.
type SedeRelations = {
    aula: Aula[];
    corso_sede: CorsoSedeWithRelations<"corso">[];
};

export type SedeWithRelations<K extends keyof SedeRelations = never> =
    Sede & Pick<SedeRelations, K>;

export type Sede = z.infer<typeof sedeSchema>;
export type CreateSede = z.infer<typeof createSedeSchema>;
export type UpdateSede = z.infer<typeof updateSedeSchema>;
