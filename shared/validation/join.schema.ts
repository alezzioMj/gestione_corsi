import { z } from "zod";

const id = z.number().int().positive();
const codiceFiscale = z.string().length(16);

export const programmaModuloSchema = z.object({
    id,
    programma_id: id,
    modulo_id: id,
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

export const corsoDocenteSchema = z.object({
    corso_id: id,
    docente_cf: codiceFiscale,
    n_ore: z.number().int().positive().nullable(),
});

export const corsoDocenteInputSchema = corsoDocenteSchema.omit({ corso_id: true });

export const corsoSedeSchema = z.object({
    corso_id: id,
    sede_id: id,
});

export const docenteModuloSchema = z.object({
    docente_cf: codiceFiscale,
    modulo_id: id,
});

export const moduloMaterialeSchema = z.object({
    modulo_id: id,
    materiale_id: id,
});

export type ProgrammaModulo = z.infer<typeof programmaModuloSchema>;
export type ProgrammaModuloInput = z.infer<typeof programmaModuloInputSchema>;
export type CorsoDocente = z.infer<typeof corsoDocenteSchema>;
export type CorsoDocenteInput = z.infer<typeof corsoDocenteInputSchema>;
export type CorsoSede = z.infer<typeof corsoSedeSchema>;
export type DocenteModulo = z.infer<typeof docenteModuloSchema>;
export type ModuloMateriale = z.infer<typeof moduloMaterialeSchema>;
