import { z } from "zod";
import { orarioSchema } from "./common.schema";
import type { Aula } from "./aula.schema";
import type { Docente } from "./docente.schema";
import type { Sede } from "./sede.schema";

export const indisponibilitaSchema = z.object({
    id: z.number().int(),
    docente_cf: z.string().length(16, "Il codice fiscale deve avere 16 caratteri").nullish(),
    sede_id: z.number().int().nullish(),
    aula_id: z.number().int().nullish(),
    data_inizio: z.coerce.date(),
    data_fine: z.coerce.date(),
    ora_inizio: orarioSchema,
    ora_fine: orarioSchema,
    causale: z.string().min(1, "La causale è obbligatoria").max(100),
    descrizione: z.string().nullish(),
});

type Intervallo = {
    data_inizio?: Date;
    data_fine?: Date;
    ora_inizio?: string;
    ora_fine?: string;
};

// controlla la coerenza solo quando tutti i campi sono presenti (in update possono mancare)
const intervalloValido = (d: Intervallo, ctx: z.RefinementCtx) => {
    if (!d.data_inizio || !d.data_fine || !d.ora_inizio || !d.ora_fine) return;

    const inizio = new Date(d.data_inizio);
    const fine = new Date(d.data_fine);

    const [oreInizio, minutiInizio] = d.ora_inizio.split(":").map(Number);
    const [oreFine, minutiFine] = d.ora_fine.split(":").map(Number);

    inizio.setHours(oreInizio, minutiInizio, 0, 0);
    fine.setHours(oreFine, minutiFine, 0, 0);

    if (fine.getTime() <= inizio.getTime()) {
        ctx.addIssue({
            code: "custom",
            path: ["data_fine"],
            message: "La data e l'ora di fine devono essere successive a quelle di inizio",
        });
    }
};

const indisponibilitaInputSchema = indisponibilitaSchema.omit({ id: true });

export const createIndisponibilitaSchema = indisponibilitaInputSchema.superRefine(intervalloValido);

export const updateIndisponibilitaSchema = indisponibilitaInputSchema
    .partial()
    .superRefine(intervalloValido);

// Allineato a INCLUDE_MAP di indisponibilitaController
type IndisponibilitaRelations = {
    docente: Docente | null;
    sede: Sede | null;
    aula: Aula | null;
};

export type IndisponibilitaWithRelations<K extends keyof IndisponibilitaRelations = never> =
    Indisponibilita & Pick<IndisponibilitaRelations, K>;

export type Indisponibilita = z.infer<typeof indisponibilitaSchema>;
export type CreateIndisponibilita = z.infer<typeof createIndisponibilitaSchema>;
export type UpdateIndisponibilita = z.infer<typeof updateIndisponibilitaSchema>;
