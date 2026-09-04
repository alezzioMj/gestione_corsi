// c:\Users\aless\Desktop\gestione_corsi\backend\src\types.ts

import { Prisma } from "@backend/generated/prisma/client";
import { corsoSchema } from '../validation/corso.schema';
import { aulaSchema } from '../validation/aula.schema';
import { docenteSchema } from '../validation/docente.schema';
import { sedeSchema } from '../validation/sede.schema';
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
    // Se il docente usa il CF come ID, non serve aggiungere id: z.number()
    createdAt: z.date().optional()
});

export const sedeDbSchema = sedeSchema.extend({
    id: z.number(),
    createdAt: z.date().optional(),
});

// Forma delle risposte di errore dalle API
export const apiErrorSchema = z.object({
  error: z.string().optional(),
  issues: z.array(z.object({
    message: z.string(),
    path: z.array(z.string()).optional(),
  })).optional(),
});

export type ApiErrorData = z.infer<typeof apiErrorSchema>;

// Esportazione dei tipi derivati dagli schemi DB
export type Corso = z.infer<typeof corsoDbSchema>;
export type Programma = z.infer<typeof programmaDbSchema>;
export type Aula = z.infer<typeof aulaDbSchema>;
export type Docente = z.infer<typeof docenteDbSchema>;
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