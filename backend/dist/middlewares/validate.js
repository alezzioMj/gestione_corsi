"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
//middleware per validare i dati in ingresso usando zod
const validate = (schema) => (req, res, next) => {
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
exports.validate = validate;
