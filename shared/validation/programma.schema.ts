import { z } from "zod";
import type { Corso } from "./corso.schema";
import type { Modulo } from "./modulo.schema";

export const programmaSchema = z.object({
    id: z.number(),
    titolo: z.string().min(1).max(150),
    descrizione: z.string().nullish(),
    durata_totale: z.number().int().positive(),
    ore_pratiche: z.number().int().nonnegative(),
    ore_teoriche: z.number().int().nonnegative(),
    ore_trasversali: z.number().int().nonnegative(),
    created_at: z.coerce.date(),
    created_by: z.string().max(100).nullable(),
});

export const createProgrammaSchema = programmaSchema.omit({
    id: true,
    created_at: true,
    created_by: true,
});

export const updateProgrammaSchema = createProgrammaSchema.partial();

// ---- tabella di collegamento gestita dal programma ----
export const programmaModuloSchema = z.object({
    id: z.number().int().positive(),
    programma_id: z.number().int().positive(),
    modulo_id: z.number().int().positive(),
    ordine: z.number().int().min(1),
    obbligatorio: z.boolean(),
    n_ripetizioni: z.number().int().min(1),
});

export const programmaModuloInputSchema = programmaModuloSchema.omit({
    id: true,
    programma_id: true,
});

export const programmaModuliInputSchema = z
    .array(programmaModuloInputSchema)
    .superRefine((righe, ctx) => {
        const visti = new Set<number>();
        righe.forEach((riga, i) => {
            if (visti.has(riga.ordine)) {
                ctx.addIssue({
                    code: "custom",
                    path: [i, "ordine"],
                    message: "Ordine duplicato",
                });
            }
            visti.add(riga.ordine);
        });
    });

export type ProgrammaModulo = z.infer<typeof programmaModuloSchema>;
export type ProgrammaModuloInput = z.infer<typeof programmaModuloInputSchema>;
type ProgrammaModuloRelations = {
    modulo: Modulo | null;
    programma: Programma;
};

export type ProgrammaModuloWithRelations<K extends keyof ProgrammaModuloRelations = never> =
    ProgrammaModulo & Pick<ProgrammaModuloRelations, K>;

// Allineato a INCLUDE_MAP di programmaController
type ProgrammaRelations = {
    programma_modulo: ProgrammaModuloWithRelations<"modulo">[];
    corso: Corso[];
};

export type ProgrammaWithRelations<K extends keyof ProgrammaRelations = never> =
    Programma & Pick<ProgrammaRelations, K>;

export type Programma = z.infer<typeof programmaSchema>;
export type CreateProgramma = z.infer<typeof createProgrammaSchema>;
export type UpdateProgramma = z.infer<typeof updateProgrammaSchema>;
