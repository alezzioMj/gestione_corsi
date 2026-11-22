// shared/validation/modulo.schema.ts

import { z } from "zod";

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
    competenza: z.enum(COMPETENZE),
    descrizione: z.string().nullable(),
    multiplo: booleanFromForm,
    created_at: z.coerce.date(),
    created_by: z.string().max(100).nullable(),
});

export const createModuloSchema = moduloSchema
    .omit({ id: true, created_at: true, created_by: true })
    .extend({
        descrizione: z.string().nullish(),
        multiplo: booleanFromForm.default(false),
    });

export const updateModuloSchema = moduloSchema
    .omit({ id: true, created_at: true, created_by: true })
    .partial();

export type Modulo = z.infer<typeof moduloSchema>;
export type CreateModulo = z.infer<typeof createModuloSchema>;
export type UpdateModulo = z.infer<typeof updateModuloSchema>;