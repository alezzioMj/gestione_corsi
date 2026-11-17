import { z } from "zod";
import { stato_commessa } from "@prisma/client";
import { clienteSchema } from "./cliente.schema";

export const commessaSchema = z.object({
  id: z.number().int(),
  codice_commessa: z.string().min(1).max(255),
  codice_ft: z.string().max(255).nullable().optional(),
  codice_rlom: z.string().max(255).nullable().optional(),
  descrizione: z.string().nullable().optional(),
  scadenza: z.coerce.date().nullable().optional(),
  cliente_id: z.number().int().nullable().optional(),
  stato: z.enum(stato_commessa).optional(), // default APERTA lato DB
});

export const commessaWithRelationsSchema = commessaSchema.extend(
  {
    cliente: clienteSchema
  }
)

export const createCommessaSchema = commessaSchema.omit({ id: true });

export const updateCommessaSchema = commessaSchema.omit({ id: true }).partial();

export type Commessa = z.infer<typeof commessaSchema>
export type CommessaWithRelations = z.infer<typeof commessaWithRelationsSchema>
export type CreateCommessa = z.infer<typeof createCommessaSchema>
export type UpdateCommessa = z.infer<typeof updateCommessaSchema>