import { z } from "zod";

export const indisponibilitaSchema = z.object({
  docente_cf: z.string()
    .length(16, "Il codice fiscale deve avere 16 caratteri")
    .nullable()
    .optional(),

  sede_id: z.number().nullable().optional(),

  aula_id: z.number().nullable().optional(),

  data_inizio: z.coerce.date(),
  data_fine: z.coerce.date(),

  ora_inizio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  ora_fine: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),

  causale: z.string().min(1, "La causale è obbligatoria").max(100),

  descrizione: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
    const inizio = new Date(data.data_inizio);
    const fine = new Date(data.data_fine);

    const [oreInizio, minutiInizio] = data.ora_inizio.split(":").map(Number);
    const [oreFine, minutiFine] = data.ora_fine.split(":").map(Number);

    inizio.setHours(oreInizio, minutiInizio, 0, 0);
    fine.setHours(oreFine, minutiFine, 0, 0);

    if (fine.getTime() <= inizio.getTime()) {
        ctx.addIssue({
            code: "custom",
            path: ["data_fine"],
            message: "La data e l'ora di fine devono essere successive a quelle di inizio",
        });
    }
});