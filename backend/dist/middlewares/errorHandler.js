"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client/runtime/client");
const types_1 = __importDefault(require("@progetto/shared/validation/types"));
const handlePrismaValidationError = (err) => {
    return new types_1.default("Invalid input data. Please check your request.", 400);
};
const handlePrismaKnownError = (err) => {
    const errorMap = {
        P2002: () => new types_1.default("Duplicate value found.", 409, "DUPLICATE_ENTRY"),
        P2003: () => new types_1.default("Invalid reference.", 400, "INVALID_REFERENCE"),
        P2025: () => new types_1.default("Record not found.", 404, "RECORD_NOT_FOUND"),
        P2021: () => new types_1.default("The table does not exist.", 500, "TABLE_NOT_FOUND"),
        P2022: () => new types_1.default("The column does not exist.", 500, "COLUMN_NOT_FOUND"),
    };
    return (errorMap[err.code]?.() ||
        new types_1.default("Database error occurred.", 500, "DATABASE_ERROR"));
};
const handlePrismaInitializationError = (err) => {
    return new types_1.default("Database connection failed. Please try again later.", 500);
};
const handlePrismaRustPanicError = (err) => {
    return new types_1.default("Critical database error occurred. Please try again.", 500);
};
// Development error response
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message,
        code: err.code,
        error: err,
        stack: err.stack,
    });
};
// Production error response
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode || 500).json({
            status: err.status,
            message: err.message,
            code: err.code,
        });
    }
    else {
        res.status(500).json({
            status: "error",
            message: "Something went wrong!",
            code: "INTERNAL_ERROR",
        });
    }
};
// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    const isDev = process.env.NODE_ENV === "development";
    let error = err;
    if (err instanceof client_1.PrismaClientValidationError) {
        error = handlePrismaValidationError(err);
    }
    else if (err instanceof client_1.PrismaClientKnownRequestError) {
        error = handlePrismaKnownError(err);
    }
    else if (err instanceof client_1.PrismaClientInitializationError) {
        error = handlePrismaInitializationError(err);
    }
    else if (err instanceof client_1.PrismaClientRustPanicError) {
        error = handlePrismaRustPanicError(err);
    }
    if (isDev) {
        sendErrorDev(error, res);
    }
    else {
        sendErrorProd(error, res);
    }
};
exports.default = globalErrorHandler;
