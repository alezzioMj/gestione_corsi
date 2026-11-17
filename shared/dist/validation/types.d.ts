import { z } from 'zod';
export declare const apiErrorSchema: z.ZodObject<{
    error: z.ZodOptional<z.ZodString>;
    issues: z.ZodOptional<z.ZodArray<z.ZodObject<{
        message: z.ZodString;
        path: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ApiErrorData = z.infer<typeof apiErrorSchema>;
export interface ApiErrorBody {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
