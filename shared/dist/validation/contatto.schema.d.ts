import { z } from 'zod';
export declare const contattoSchema: z.ZodObject<{
    id: z.ZodNumber;
    sede_id: z.ZodNumber;
    nome: z.ZodString;
    email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
