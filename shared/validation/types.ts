import { z } from 'zod';

export const apiErrorSchema = z.object({
    error: z.string().optional(),
    issues: z.array(z.object({
        message: z.string(),
        path: z.array(z.string()).optional(),
    })).optional(),
});

export type ApiErrorData = z.infer<typeof apiErrorSchema>;

export interface ApiErrorBody {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}