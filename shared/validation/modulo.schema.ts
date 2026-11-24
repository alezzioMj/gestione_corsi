// shared/validation/modulo.schema.ts

import { z } from "zod";
import type { DocenteModuloWithRelations } from "./docente.schema";
import { fileUploadSchema, type Materiale } from "./materiale.schema";
import type { ProgrammaModuloWithRelations } from "./programma.schema";

export const COMPETENZE = ["Teorica", "Trasversale", "Pratica"] as const;
export type Competenza = (typeof COMPETENZE)[number];

export const booleanFromForm = z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true");

export const moduloSchema = z.object({
    id: z.number().int(),
    titolo: z
        .string()
        .trim()
        .min(1, "Il titolo è obbligatorio")
        .max(150, "Il titolo può avere massimo 150 caratteri"),
    n_ore: z.coerce.number().int().positive().nullable(), // n_ore Int? @default(4) nel modello Prisma
    competenza: z.enum(COMPETENZE),
    descrizione: z.string().nullable(),
    multiplo: booleanFromForm,
    created_at: z.coerce.date(),
    created_by: z.string().max(100).nullable(),
});

// i default stanno solo in create: nel partial() di update si riapplicherebbero (Zod 4)
export const createModuloSchema = moduloSchema
    .omit({ id: true, created_at: true, created_by: true })
    .extend({
        n_ore: z.coerce.number().int().positive().optional(), // se manca, vale il default del database (4)
        descrizione: z.string().nullish(),
        multiplo: booleanFromForm.default(false),
    });

export const updateModuloSchema = moduloSchema
    .omit({ id: true, created_at: true, created_by: true })
    .partial();

export type ModuloMateriale = { modulo_id: number; materiale_id: number };

type ModuloMaterialeRelations = { modulo: Modulo; materiale: Materiale };

export type ModuloMaterialeWithRelations<K extends keyof ModuloMaterialeRelations = never> =
    ModuloMateriale & Pick<ModuloMaterialeRelations, K>;

// Allineato a INCLUDE_MAP di moduloController
type ModuloRelations = {
    docente_modulo: DocenteModuloWithRelations<"docente">[];
    modulo_materiale: ModuloMaterialeWithRelations<"materiale">[];
    programma_modulo: ProgrammaModuloWithRelations<"programma">[];
};

export type ModuloWithRelations<K extends keyof ModuloRelations = never> =
    Modulo & Pick<ModuloRelations, K>;

export type Modulo = z.infer<typeof moduloSchema>;
export type CreateModulo = z.infer<typeof createModuloSchema>;
export type UpdateModulo = z.infer<typeof updateModuloSchema>;
