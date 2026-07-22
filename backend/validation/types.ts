/**
 * @file Questo file definisce i tipi e gli schemi Zod condivisi 
 * tra il frontend e il backend.
 * 
 * NOTA: Per una migliore manutenibilità, questo file dovrebbe essere 
 * spostato in una directory condivisa (es. 'packages/shared' in un monorepo) 
 * per essere facilmente importato sia dal frontend che dal backend.
 */
import { Prisma } from '@prisma/client';
import { corsoSchema } from './corso.schema';
import { aulaSchema } from './aula.schema';
import { docenteSchema } from './docente.schema';
import { sedeSchema } from './sede.schema';
import { programmaSchema } from './programma.schema';
import { z } from 'zod';

// Schema per l'INVIO (Input dal form/frontend)
export type CorsoFormInput = z.infer<typeof corsoSchema>; 
export type AulaFormInput = z.infer<typeof aulaSchema>;
export type DocenteFormInput = z.infer<typeof docenteSchema>;
export type SedeFormInput = z.infer<typeof sedeSchema>;
export type ProgrammaFormInput = z.infer<typeof programmaSchema>;

// Schema esteso per il FETCH (Dati che arrivano dal Database)
export const corsoDbSchema = corsoSchema.extend({
    id: z.number(),
    createdAt: z.date().optional()
});

export const programmaDbSchema = programmaSchema.extend({
    id: z.number(),
    createdAt: z.date().optional()
});

export const aulaDbSchema = aulaSchema.extend({
    id: z.number(),
    createdAt: z.date().optional(),
});

export const docenteDbSchema = docenteSchema.extend({
    // Il docente usa il CF come chiave primaria, quindi non ha un campo 'id' numerico.
    createdAt: z.date().optional()
});

export const sedeDbSchema = sedeSchema.extend({
    id: z.number(),
    createdAt: z.date().optional(),
});

// Esportazione dei tipi derivati dagli schemi DB
export type Corso = z.infer<typeof corsoDbSchema>;
export type Programma = z.infer<typeof programmaDbSchema>;
export type Aula = z.infer<typeof aulaDbSchema>;
export type Docente = z.infer<typeof docenteSchema>;
export type Sede = z.infer<typeof sedeDbSchema>;

export type SessioneWithRelations = Prisma.sessioneGetPayload<{
    include: {
        corso: true;
        docente: true;
        modulo: true;
        aula: true;
        sede: true;
    };
}>;