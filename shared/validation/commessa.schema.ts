import { z } from "zod";

export const statiCommessa = [
  "APERTA",
  "IN_CORSO",
  "CHIUSA",
  "ANNULLATA"
] as const;

export const commessaSchema = z.object({
  id: z.number().int(),
  codice_commessa: z.string().min(1).max(255),
  codice_ft: z.string().max(255).nullable().optional(),
  codice_rlom: z.string().max(255).nullable().optional(),
  descrizione: z.string().nullable().optional(),
  scadenza: z.coerce.date().nullable().optional(),
  cliente_id: z.number().int().nullable().optional(),stato: z.enum(statiCommessa).optional(),
});

// Per la creazione l'id non c'è (autoincrement)
export const createCommessaSchema = commessaSchema.omit({ id: true });

// Per la modifica parziale
export const updateCommessaSchema = commessaSchema.omit({ id: true }).partial();