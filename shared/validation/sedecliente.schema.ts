import { z } from "zod";
import type { Cliente } from "./cliente.schema";
import type { Contatto } from "./contatto.schema";

export const TIPI_SEDE_CLIENTE = ["LEGALE", "OPERATIVA"] as const;

export const sedeClienteSchema = z.object({
    id: z.number(),
    cliente_id: z.number(),
    tipo: z.enum(TIPI_SEDE_CLIENTE),
    nome: z.string().nullish(), // nome String? nel modello Prisma
    indirizzo: z.string().min(1),
    civico: z.string().min(1),
    cap: z.string().min(1),
    citta: z.string().min(1),
    provincia: z.string().min(1),
});

export const createSedeClienteSchema = sedeClienteSchema
    .omit({ id: true })
    .extend({ tipo: z.enum(TIPI_SEDE_CLIENTE).default("OPERATIVA") });

export const updateSedeClienteSchema = sedeClienteSchema
    .omit({ id: true })
    .partial();

type SedeClienteRelations = {
    contatti: Contatto[];
    cliente: Cliente;
};

export type SedeClienteWithRelations<K extends keyof SedeClienteRelations = never> =
    SedeCliente & Pick<SedeClienteRelations, K>;

export type SedeCliente = z.infer<typeof sedeClienteSchema>;
export type CreateSedeCliente = z.infer<typeof createSedeClienteSchema>;
export type UpdateSedeCliente = z.infer<typeof updateSedeClienteSchema>;
