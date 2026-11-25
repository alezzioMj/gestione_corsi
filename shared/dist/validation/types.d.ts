import { z } from 'zod';
declare class AppError extends Error {
    statusCode: number;
    status: "fail" | "error";
    isOperational: boolean;
    code?: string;
    constructor(message: string, statusCode: number, code?: string);
}
export default AppError;
export declare const formSchema: z.ZodObject<{
    nome: z.ZodString;
    commessa_id: z.ZodNumber;
    sedi: z.ZodArray<z.ZodNumber>;
    programmi: z.ZodNumber;
    docenti: z.ZodArray<z.ZodString>;
    oreTotali: z.ZodNumber;
    moduliOrdinati: z.ZodArray<z.ZodString>;
    dataInizio: z.ZodString;
    dataFine: z.ZodString;
    giorni: z.ZodArray<z.ZodNumber>;
    mattina_inizio: z.ZodString;
    mattina_fine: z.ZodString;
    pomeriggio_inizio: z.ZodString;
    pomeriggio_fine: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type FormType = z.infer<typeof formSchema>;
