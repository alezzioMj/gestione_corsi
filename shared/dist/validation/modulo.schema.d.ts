import { z } from "zod";
import type { DocenteModuloWithRelations } from "./docente.schema";
import { type Materiale } from "./materiale.schema";
import type { ProgrammaModuloWithRelations } from "./programma.schema";
export declare const COMPETENZE: readonly ["Teorica", "Trasversale", "Pratica"];
export type Competenza = (typeof COMPETENZE)[number];
export declare const booleanFromForm: z.ZodPipe<z.ZodUnion<readonly [z.ZodBoolean, z.ZodEnum<{
    true: "true";
    false: "false";
}>]>, z.ZodTransform<boolean, boolean | "true" | "false">>;
export declare const moduloSchema: z.ZodObject<{
    id: z.ZodNumber;
    titolo: z.ZodString;
    n_ore: z.ZodNullable<z.ZodCoercedNumber<unknown>>;
    competenza: z.ZodEnum<{
        Teorica: "Teorica";
        Trasversale: "Trasversale";
        Pratica: "Pratica";
    }>;
    descrizione: z.ZodNullable<z.ZodString>;
    multiplo: z.ZodPipe<z.ZodUnion<readonly [z.ZodBoolean, z.ZodEnum<{
        true: "true";
        false: "false";
    }>]>, z.ZodTransform<boolean, boolean | "true" | "false">>;
    created_at: z.ZodCoercedDate<unknown>;
    created_by: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const createModuloSchema: z.ZodObject<{
    titolo: z.ZodString;
    competenza: z.ZodEnum<{
        Teorica: "Teorica";
        Trasversale: "Trasversale";
        Pratica: "Pratica";
    }>;
    n_ore: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    multiplo: z.ZodDefault<z.ZodPipe<z.ZodUnion<readonly [z.ZodBoolean, z.ZodEnum<{
        true: "true";
        false: "false";
    }>]>, z.ZodTransform<boolean, boolean | "true" | "false">>>;
}, z.core.$strip>;
export declare const updateModuloSchema: z.ZodObject<{
    descrizione: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    n_ore: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    multiplo: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodBoolean, z.ZodEnum<{
        true: "true";
        false: "false";
    }>]>, z.ZodTransform<boolean, boolean | "true" | "false">>>;
    titolo: z.ZodOptional<z.ZodString>;
    competenza: z.ZodOptional<z.ZodEnum<{
        Teorica: "Teorica";
        Trasversale: "Trasversale";
        Pratica: "Pratica";
    }>>;
}, z.core.$strip>;
export type ModuloMateriale = {
    modulo_id: number;
    materiale_id: number;
};
type ModuloMaterialeRelations = {
    modulo: Modulo;
    materiale: Materiale;
};
export type ModuloMaterialeWithRelations<K extends keyof ModuloMaterialeRelations = never> = ModuloMateriale & Pick<ModuloMaterialeRelations, K>;
type ModuloRelations = {
    docente_modulo: DocenteModuloWithRelations<"docente">[];
    modulo_materiale: ModuloMaterialeWithRelations<"materiale">[];
    programma_modulo: ProgrammaModuloWithRelations<"programma">[];
};
export type ModuloWithRelations<K extends keyof ModuloRelations = never> = Modulo & Pick<ModuloRelations, K>;
export type Modulo = z.infer<typeof moduloSchema>;
export type CreateModulo = z.infer<typeof createModuloSchema>;
export type UpdateModulo = z.infer<typeof updateModuloSchema>;
export {};
