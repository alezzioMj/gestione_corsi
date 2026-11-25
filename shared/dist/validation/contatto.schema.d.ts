import { z } from "zod";
import type { SedeCliente } from "./sedecliente.schema";
export declare const contattoSchema: z.ZodObject<{
    id: z.ZodNumber;
    sede_id: z.ZodNumber;
    nome: z.ZodString;
    email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createContattoSchema: z.ZodObject<{
    nome: z.ZodString;
    email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sede_id: z.ZodNumber;
}, z.core.$strip>;
export declare const updateContattoSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEmail>>>;
    telefono: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    sede_id: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
type ContattoRelations = {
    sede: SedeCliente;
};
export type ContattoWithRelations<K extends keyof ContattoRelations = never> = Contatto & Pick<ContattoRelations, K>;
export type Contatto = z.infer<typeof contattoSchema>;
export type CreateContatto = z.infer<typeof createContattoSchema>;
export type UpdateContatto = z.infer<typeof updateContattoSchema>;
export {};
