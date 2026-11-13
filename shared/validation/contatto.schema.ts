import { z } from 'zod';

export const contattoSchema = z.object({
  id: z.number().int(),
  sede_id: z.number().int(),
  nome: z.string().max(150),
  email: z.email().max(255).nullable().optional(),
  telefono: z.string().max(30).nullable().optional(),
});