import { z } from "zod";
export declare const materialeSchema: z.ZodObject<{
    url: z.ZodURL;
    file_name: z.ZodString;
    tipo: z.ZodString;
    descrizione: z.ZodOptional<z.ZodString>;
    created_by: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
