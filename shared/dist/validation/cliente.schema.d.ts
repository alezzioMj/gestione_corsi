import z from "zod";
export declare const clienteSchema: z.ZodObject<{
    id: z.ZodNumber;
    ragione_sociale: z.ZodString;
    partita_iva: z.ZodString;
    agente_id: z.ZodNumber;
}, z.core.$strip>;
export declare const clienteWithRelationsSchema: z.ZodObject<{
    id: z.ZodNumber;
    ragione_sociale: z.ZodString;
    partita_iva: z.ZodString;
    agente_id: z.ZodNumber;
    sedi: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createClienteSchema: z.ZodObject<{
    ragione_sociale: z.ZodString;
    partita_iva: z.ZodString;
    sedi: z.ZodArray<z.ZodObject<{
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
        id: z.ZodOptional<z.ZodNumber>;
        contatti: z.ZodArray<z.ZodObject<{
            email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
            nome: z.ZodString;
            telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            id: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateClienteSchema: z.ZodObject<{
    ragione_sociale: z.ZodOptional<z.ZodString>;
    partita_iva: z.ZodOptional<z.ZodString>;
    id: z.ZodNumber;
    sedi: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        id: z.ZodNumber;
        contatti: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sede_id: z.ZodOptional<z.ZodNumber>;
            nome: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEmail>>>;
            telefono: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
            id: z.ZodNumber;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type Cliente = z.infer<typeof clienteSchema>;
export type ClienteWithRelations = z.infer<typeof clienteWithRelationsSchema>;
export type CreateCliente = z.infer<typeof createClienteSchema>;
export type UpdateCliente = z.infer<typeof updateClienteSchema>;
