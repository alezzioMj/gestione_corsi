import z from "zod";
export declare const sedeClienteSchema: z.ZodObject<{
    id: z.ZodNumber;
    tipo: z.ZodEnum<{
        LEGALE: "LEGALE";
        OPERATIVA: "OPERATIVA";
    }>;
    cliente_id: z.ZodNumber;
    nome: z.ZodString;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
}, z.core.$strip>;
export declare const SedeClienteWithRelationsSchema: z.ZodObject<{
    id: z.ZodNumber;
    tipo: z.ZodEnum<{
        LEGALE: "LEGALE";
        OPERATIVA: "OPERATIVA";
    }>;
    cliente_id: z.ZodNumber;
    nome: z.ZodString;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
    contatti: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        sede_id: z.ZodNumber;
        nome: z.ZodString;
        email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
        telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createSedeClienteSchema: z.ZodObject<{
    nome: z.ZodString;
    indirizzo: z.ZodString;
    civico: z.ZodString;
    cap: z.ZodString;
    citta: z.ZodString;
    provincia: z.ZodString;
    tipo: z.ZodEnum<{
        LEGALE: "LEGALE";
        OPERATIVA: "OPERATIVA";
    }>;
    cliente_id: z.ZodNumber;
}, z.core.$strip>;
export declare const updateSedeClienteSchema: z.ZodObject<{
    id: z.ZodNonOptional<z.ZodOptional<z.ZodNumber>>;
    tipo: z.ZodOptional<z.ZodEnum<{
        LEGALE: "LEGALE";
        OPERATIVA: "OPERATIVA";
    }>>;
    cliente_id: z.ZodOptional<z.ZodNumber>;
    nome: z.ZodOptional<z.ZodString>;
    indirizzo: z.ZodOptional<z.ZodString>;
    civico: z.ZodOptional<z.ZodString>;
    cap: z.ZodOptional<z.ZodString>;
    citta: z.ZodOptional<z.ZodString>;
    provincia: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SedeCliente = z.infer<typeof sedeClienteSchema>;
export type SedeClienteWithRelations = z.infer<typeof SedeClienteWithRelationsSchema>;
export type createSedeCliente = z.infer<typeof createSedeClienteSchema>;
export type updateSedeCliente = z.infer<typeof updateSedeClienteSchema>;
