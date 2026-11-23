import { z } from "zod";
import { agenteInputSchema } from "./agente.schema";
import type { Agente } from "./agente.schema";
import { contattoSchema } from "./contatto.schema";
import { sedeClienteSchema, TIPI_SEDE_CLIENTE } from "./sedecliente.schema";
import type { SedeClienteWithRelations } from "./sedecliente.schema";
import type { Commessa } from "./commessa.schema";

export const clienteSchema = z.object({
    id: z.number(),
    ragione_sociale: z.string().min(1),
    partita_iva: z.string().min(1),
    agente_id: z.number().nullable(), // agente_id Int? nel modello Prisma
});

// ---- contatti ----
const contattoNuovoSchema = contattoSchema.omit({ id: true, sede_id: true });

const contattoEsistenteSchema = contattoNuovoSchema
    .partial()
    .extend({ id: z.number().int().positive() });

// ---- sedi ----
const sedeNuovaSchema = sedeClienteSchema
    .omit({ id: true, cliente_id: true })
    .extend({
        tipo: z.enum(TIPI_SEDE_CLIENTE).default("OPERATIVA"),
        contatti: z.array(contattoNuovoSchema).optional(),
    });

const sedeEsistenteSchema = sedeClienteSchema
    .omit({ id: true, cliente_id: true })
    .partial()
    .extend({
        id: z.number().int().positive(),
        contatti: z
            .array(z.union([contattoEsistenteSchema, contattoNuovoSchema]))
            .optional(),
    });

// ---- create: agente completo, con id se esiste già ----
export const createClienteSchema = clienteSchema
    .omit({ id: true, agente_id: true })
    .extend({
        agente: agenteInputSchema.optional(),
        sedi: z.array(sedeNuovaSchema).optional(),
    });

// ---- update: tutto opzionale, agente_id null = scollega ----
export const updateClienteSchema = clienteSchema
    .omit({ id: true })
    .partial()
    .extend({
        sedi: z.array(z.union([sedeEsistenteSchema, sedeNuovaSchema])).optional(),
    });

// Allineato a INCLUDE_MAP di clientiController: le sedi arrivano sempre con i contatti
type ClienteRelations = {
    agente: Agente | null;
    sedi: SedeClienteWithRelations<"contatti">[];
    commesse: Commessa[];
};

export type ClienteWithRelations<K extends keyof ClienteRelations = never> =
    Cliente & Pick<ClienteRelations, K>;

export type Cliente = z.infer<typeof clienteSchema>;
export type CreateCliente = z.infer<typeof createClienteSchema>;
export type UpdateCliente = z.infer<typeof updateClienteSchema>;
