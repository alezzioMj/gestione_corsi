import { z } from 'zod';
import { moduloSchema } from './modulo.schema';
import { sessioneSchema } from './sessione.schema';
import { materialeSchema } from './materiale.schema';
import { indisponibilitaSchema } from './indisponibilita.schema';
import { clienteSchema } from './cliente.schema';
import { sedeClienteSchema } from './sedecliente.schema';
import { contattoSchema } from './contatto.schema';
import { commessaSchema } from './commessa.schema';

export const moduloDbSchema = moduloSchema.extend(
    {
        id: z.number(),
        createdAt: z.date().optional()
    }
)

export const sessioneDbSchema = sessioneSchema.extend({
    id: z.number().int().positive()
}
)
export const apiErrorSchema = z.object({
    error: z.string().optional(),
    issues: z.array(z.object({
        message: z.string(),
        path: z.array(z.string()).optional(),
    })).optional(),
});

export type ApiErrorData = z.infer<typeof apiErrorSchema>;

export type Cliente = z.infer<typeof clienteSchema>
export type CommessaSchema = z.infer<typeof commessaSchema>
export type Contatto = z.infer<typeof contattoSchema>
export type SedeCliente = z.infer<typeof sedeClienteSchema>
export type Modulo = z.infer<typeof moduloDbSchema>;
export type Materiale = z.infer<typeof materialeSchema>;
export type Indisponibilita = z.infer<typeof indisponibilitaSchema>

export const SedeWithRelations = sedeClienteSchema.extend({
    contatti: z.array(contattoSchema),
});

export type SedeWithRelations = z.infer<typeof SedeWithRelations>;

export const ClienteWithRelations = clienteSchema.extend({
    sedi: z.array(SedeWithRelations),
});

export const ClienteUpdateSchema = ClienteWithRelations.omit({
    id: true,
    agente_id: true
}).extend({
    sedi: z.array(
        ClienteWithRelations.shape.sedi.element.omit({
            cliente_id: true,
            id: true
        }).extend({
            id: z.number().int().positive().optional(),

            contatti: z.array(
                ClienteWithRelations.shape.sedi.element.shape.contatti.element
                    .omit({
                        sede_id: true,
                        id: true
                    })
                    .extend({
                        id: z.number().int().positive().optional()
                    })
            )
        })
    )
});

export type ClienteWithRelations = z.infer<typeof ClienteWithRelations>;

export const SessioneWithRelations = sessioneDbSchema.extend({
    corso: corsoDbSchema,
    docente: docenteDbSchema,
    modulo: moduloSchema,
    aula: aulaDbSchema,
    sede: sedeDbSchema,
});

export type SessioneWithRelations = z.infer<typeof SessioneWithRelations>;

export interface ApiErrorBody {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}