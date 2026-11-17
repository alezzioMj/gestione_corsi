import { z } from 'zod';

export const contattoSchema = z.object({
  id: z.number().int(),
  sede_id: z.number().int(),
  nome: z.string().max(150),
  email: z.email().max(255).nullable().optional(),
  telefono: z.string().max(30).nullable().optional(),
});

export const createContattoSchema = contattoSchema.omit({id:true})

export const updateContattoSchema = contattoSchema.partial().required({id:true})

export type Contatto = z.infer<typeof contattoSchema>
export type CreateContatto = z.infer<typeof createContattoSchema>
export type UpdateContatto = z.infer<typeof updateContattoSchema>