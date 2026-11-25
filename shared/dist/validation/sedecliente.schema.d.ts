import { z } from "zod";
import type { Cliente } from "./cliente.schema";
import type { Contatto } from "./contatto.schema";
export declare const TIPI_SEDE_CLIENTE: readonly ["LEGALE", "OPERATIVA"];
export declare const sedeClienteSchema: z.ZodObject<{
    id: z.ZodNumber;
    cliente_id: z.ZodNumber;
    tipo: z.ZodEnum<{
        LEGALE: "LEGALE";
        OPERATIVA: "OPERATIVA";
    }>;
    nome: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
}, z.core.$strip>;
export declare const createSedeClienteSchema: z.ZodObject<{
    cliente_id: z.ZodNumber;
    nome: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
    tipo: z.ZodDefault<z.ZodEnum<{
        LEGALE: "LEGALE";
        OPERATIVA: "OPERATIVA";
    }>>;
}, z.core.$strip>;
export declare const updateSedeClienteSchema: z.ZodObject<{
    cliente_id: z.ZodOptional<z.ZodNumber>;
    tipo: z.ZodOptional<z.ZodEnum<{
        LEGALE: "LEGALE";
        OPERATIVA: "OPERATIVA";
    }>>;
    nome: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    indirizzo: z.ZodOptional<z.ZodString>;
    civico: z.ZodOptional<z.ZodString>;
    cap: z.ZodOptional<z.ZodString>;
    citta: z.ZodOptional<z.ZodString>;
    provincia: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type SedeClienteRelations = {
    contatti: Contatto[];
    cliente: Cliente;
};
export type SedeClienteWithRelations<K extends keyof SedeClienteRelations = never> = SedeCliente & Pick<SedeClienteRelations, K>;
export type SedeCliente = z.infer<typeof sedeClienteSchema>;
export type CreateSedeCliente = z.infer<typeof createSedeClienteSchema>;
export type UpdateSedeCliente = z.infer<typeof updateSedeClienteSchema>;
export {};
