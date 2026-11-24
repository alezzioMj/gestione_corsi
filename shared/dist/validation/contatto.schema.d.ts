import { z } from 'zod';
export declare const contattoSchema: z.ZodObject<{
    id: z.ZodNumber;
    sede_id: z.ZodNumber;
    nome: z.ZodString;
    email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createContattoSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
    nome: z.ZodString;
    sede_id: z.ZodNumber;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateContattoSchema: z.ZodObject<{
    id: z.ZodNonOptional<z.ZodOptional<z.ZodNumber>>;
    sede_id: z.ZodOptional<z.ZodNumber>;
    nome: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEmail>>>;
    telefono: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
export type Contatto = z.infer<typeof contattoSchema>;
export type CreateContatto = z.infer<typeof createContattoSchema>;
export type UpdateContatto = z.infer<typeof updateContattoSchema>;
