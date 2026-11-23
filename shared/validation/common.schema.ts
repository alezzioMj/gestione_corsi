import { z } from "zod";

export const orarioSchema = z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Orario non valido (HH:mm)");
