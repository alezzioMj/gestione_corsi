import { z } from "zod";

export const materialeSchema = z.object({
  url: z.url("URL non valido").max(255),

  file_name: z.string()
    .min(1, "Il nome file è obbligatorio")
    .max(255, "Nome file troppo lungo"),

  tipo: z.string()
    .min(1, "Il tipo è obbligatorio")
    .max(50, "Tipo troppo lungo"),

  descrizione: z.string().optional(),

  created_by: z.string()
    .max(100, "created_by troppo lungo")
    .optional(),
});