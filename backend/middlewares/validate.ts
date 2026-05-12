import { z } from "zod";
import { Request, Response, NextFunction } from "express";

//middleware per validare i dati in ingresso usando zod
export const validate =
  (schema: z.ZodTypeAny) => 
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body); 

    if (!result.success) {
      return res.status(400).json({
        error: "Validation error",
        issues: result.error.issues,
      });
    }

    req.body = result.data;
    next();
  };