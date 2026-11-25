import { z } from "zod";
import type { Corso } from "./corso.schema";
import type { Modulo } from "./modulo.schema";
export declare const programmaSchema: z.ZodObject<{
    id: z.ZodNumber;
    titolo: z.ZodString;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    durata_totale: z.ZodNumber;
    ore_pratiche: z.ZodNumber;
    ore_teoriche: z.ZodNumber;
    ore_trasversali: z.ZodNumber;
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const createProgrammaSchema: z.ZodObject<{
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    titolo: z.ZodString;
    durata_totale: z.ZodNumber;
    ore_pratiche: z.ZodNumber;
    ore_teoriche: z.ZodNumber;
    ore_trasversali: z.ZodNumber;
}, z.core.$strip>;
export declare const updateProgrammaSchema: z.ZodObject<{
    descrizione: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    titolo: z.ZodOptional<z.ZodString>;
    durata_totale: z.ZodOptional<z.ZodNumber>;
    ore_pratiche: z.ZodOptional<z.ZodNumber>;
    ore_teoriche: z.ZodOptional<z.ZodNumber>;
    ore_trasversali: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const programmaModuloSchema: z.ZodObject<{
    id: z.ZodNumber;
    programma_id: z.ZodNumber;
    modulo_id: z.ZodNumber;
    ordine: z.ZodNumber;
    obbligatorio: z.ZodBoolean;
    n_ripetizioni: z.ZodNumber;
}, z.core.$strip>;
export declare const programmaModuloInputSchema: z.ZodObject<{
    ordine: z.ZodNumber;
    modulo_id: z.ZodNumber;
    obbligatorio: z.ZodBoolean;
    n_ripetizioni: z.ZodNumber;
}, z.core.$strip>;
export declare const programmaModuliInputSchema: z.ZodArray<z.ZodObject<{
    ordine: z.ZodNumber;
    modulo_id: z.ZodNumber;
    obbligatorio: z.ZodBoolean;
    n_ripetizioni: z.ZodNumber;
}, z.core.$strip>>;
export type ProgrammaModulo = z.infer<typeof programmaModuloSchema>;
export type ProgrammaModuloInput = z.infer<typeof programmaModuloInputSchema>;
type ProgrammaModuloRelations = {
    modulo: Modulo | null;
    programma: Programma;
};
export type ProgrammaModuloWithRelations<K extends keyof ProgrammaModuloRelations = never> = ProgrammaModulo & Pick<ProgrammaModuloRelations, K>;
type ProgrammaRelations = {
    programma_modulo: ProgrammaModuloWithRelations<"modulo">[];
    corso: Corso[];
};
export type ProgrammaWithRelations<K extends keyof ProgrammaRelations = never> = Programma & Pick<ProgrammaRelations, K>;
export type Programma = z.infer<typeof programmaSchema>;
export type CreateProgramma = z.infer<typeof createProgrammaSchema>;
export type UpdateProgramma = z.infer<typeof updateProgrammaSchema>;
export {};
