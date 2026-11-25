import { z } from "zod";
import type { Agente } from "./agente.schema";
import type { SedeClienteWithRelations } from "./sedecliente.schema";
import type { Commessa } from "./commessa.schema";
export declare const clienteSchema: z.ZodObject<{
    id: z.ZodNumber;
    ragione_sociale: z.ZodString;
    partita_iva: z.ZodString;
    agente_id: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export declare const createClienteSchema: z.ZodObject<{
    ragione_sociale: z.ZodString;
    partita_iva: z.ZodString;
    agente: z.ZodOptional<z.ZodObject<{
        nome: z.ZodString;
        cognome: z.ZodString;
        email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
        telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        id: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    sedi: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        contatti: z.ZodOptional<z.ZodArray<z.ZodObject<{
            nome: z.ZodString;
            email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
            telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateClienteSchema: z.ZodObject<{
    ragione_sociale: z.ZodOptional<z.ZodString>;
    partita_iva: z.ZodOptional<z.ZodString>;
    agente_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sedi: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
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
        id: z.ZodNumber;
        contatti: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            nome: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEmail>>>;
            telefono: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
            id: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            nome: z.ZodString;
            email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
            telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>]>>>;
    }, z.core.$strip>, z.ZodObject<{
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
        contatti: z.ZodOptional<z.ZodArray<z.ZodObject<{
            nome: z.ZodString;
            email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
            telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>]>>>;
}, z.core.$strip>;
type ClienteRelations = {
    agente: Agente | null;
    sedi: SedeClienteWithRelations<"contatti">[];
    commesse: Commessa[];
};
export type ClienteWithRelations<K extends keyof ClienteRelations = never> = Cliente & Pick<ClienteRelations, K>;
export type Cliente = z.infer<typeof clienteSchema>;
export type CreateCliente = z.infer<typeof createClienteSchema>;
export type UpdateCliente = z.infer<typeof updateClienteSchema>;
export {};
