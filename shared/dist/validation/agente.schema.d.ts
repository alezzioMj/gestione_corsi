import { z } from "zod";
import type { Cliente } from "./cliente.schema";
export declare const agenteSchema: z.ZodObject<{
    id: z.ZodNumber;
    nome: z.ZodString;
    cognome: z.ZodString;
    email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const agenteInputSchema: z.ZodObject<{
    nome: z.ZodString;
    cognome: z.ZodString;
    email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    id: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const createAgenteSchema: z.ZodObject<{
    nome: z.ZodString;
    cognome: z.ZodString;
    email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateAgenteSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    cognome: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEmail>>>;
    telefono: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
type AgenteRelations = {
    clienti: Cliente[];
};
export type AgenteWithRelations<K extends keyof AgenteRelations = never> = Agente & Pick<AgenteRelations, K>;
export type Agente = z.infer<typeof agenteSchema>;
export type AgenteInput = z.infer<typeof agenteInputSchema>;
export type CreateAgente = z.infer<typeof createAgenteSchema>;
export type UpdateAgente = z.infer<typeof updateAgenteSchema>;
export {};
