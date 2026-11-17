import z from "zod";
import { SedeWithRelationsSchema } from "./sede.schema";
import { sedeClienteSchema, SedeClienteWithRelationsSchema } from "./sedecliente.schema";

export const clienteSchema = z.object({
    id: z.number(),
    ragione_sociale: z.string(),
    partita_iva: z.string(),
    agente_id: z.number(),
})

export const clienteWithRelationsSchema = clienteSchema.extend({
    sedi: z.array(SedeClienteWithRelationsSchema),
});

export const createClienteSchema = clienteWithRelationsSchema.omit({
    id: true,
    agente_id: true
}).extend({
    sedi: z.array(
        clienteWithRelationsSchema.shape.sedi.element.omit({
            cliente_id: true,
            id: true
        }).extend({
            id: z.number().int().positive().optional(),

            contatti: z.array(
                clienteWithRelationsSchema.shape.sedi.element.shape.contatti.element
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
export const updateClienteSchema = clienteWithRelationsSchema
    .omit({
        agente_id: true
    })
    .partial()
    .extend({
        sedi: clienteWithRelationsSchema.shape.sedi.element
            .omit({ cliente_id: true })
            .partial()
            .extend({
                id: z.number().int().positive(),
                contatti: z.array(
                    clienteWithRelationsSchema.shape.sedi.element.shape.contatti.element
                        .omit({ sede_id: true })
                        .partial()
                        .extend({ id: z.number().int().positive() })
                ).optional(),
            })
            .array()
            .optional(),
    });

export type Cliente = z.infer<typeof clienteSchema>
export type ClienteWithRelations = z.infer<typeof clienteWithRelationsSchema>
export type CreateCliente = z.infer<typeof createClienteSchema>
export type UpdateCliente = z.infer<typeof updateClienteSchema>