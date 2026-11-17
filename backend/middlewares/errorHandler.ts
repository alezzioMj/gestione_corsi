import { NextFunction, Request, Response } from "express";
import {
    PrismaClientKnownRequestError,
    PrismaClientValidationError,
    PrismaClientInitializationError,
    PrismaClientRustPanicError,
} from "@prisma/client/runtime/client";
import AppError from "@progetto/shared/validation/types";

interface ErrorWithCode extends Error {
    code?: string;
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}

const handlePrismaValidationError = (
    err: PrismaClientValidationError
): AppError => {
    return new AppError(
        "Invalid input data. Please check your request.",
        400
    );
};

const handlePrismaKnownError = (
    err: PrismaClientKnownRequestError
): AppError => {
    const errorMap: Record<string, () => AppError> = {
        P2002: () =>
            new AppError(
                "Duplicate value found.",
                409,
                "DUPLICATE_ENTRY"
            ),

        P2003: () =>
            new AppError(
                "Invalid reference.",
                400,
                "INVALID_REFERENCE"
            ),

        P2025: () =>
            new AppError(
                "Record not found.",
                404,
                "RECORD_NOT_FOUND"
            ),

        P2021: () =>
            new AppError(
                "The table does not exist.",
                500,
                "TABLE_NOT_FOUND"
            ),

        P2022: () =>
            new AppError(
                "The column does not exist.",
                500,
                "COLUMN_NOT_FOUND"
            ),
    };

    return (
        errorMap[err.code]?.() ||
        new AppError(
            "Database error occurred.",
            500,
            "DATABASE_ERROR"
        )
    );
};
const handlePrismaInitializationError = (
    err: PrismaClientInitializationError
): AppError => {
    return new AppError(
        "Database connection failed. Please try again later.",
        500
    );
};

const handlePrismaRustPanicError = (
    err: PrismaClientRustPanicError
): AppError => {
    return new AppError(
        "Critical database error occurred. Please try again.",
        500
    );
};

// Development error response
const sendErrorDev = (
    err: ErrorWithCode,
    res: Response
): void => {
    res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message,
        code: err.code,
        error: err,
        stack: err.stack,
    });
};

// Production error response
const sendErrorProd = (
    err: ErrorWithCode,
    res: Response
): void => {
    if (err.isOperational) {
        res.status(err.statusCode || 500).json({
            status: err.status,
            message: err.message,
            code: err.code,
        });
    } else {
        res.status(500).json({
            status: "error",
            message: "Something went wrong!",
            code: "INTERNAL_ERROR",
        });
    }
};

// Global error handling middleware
const globalErrorHandler = (
    err: ErrorWithCode,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    const isDev = process.env.NODE_ENV === "development";
    let error = err;

    if (err instanceof PrismaClientValidationError) {
        error = handlePrismaValidationError(err);
    } else if (err instanceof PrismaClientKnownRequestError) {
        error = handlePrismaKnownError(err);
    } else if (
        err instanceof PrismaClientInitializationError
    ) {
        error = handlePrismaInitializationError(err);
    } else if (err instanceof PrismaClientRustPanicError) {
        error = handlePrismaRustPanicError(err);
    }

    if (isDev) {
        sendErrorDev(error, res);
    } else {
        sendErrorProd(error, res);
    }
};

export default globalErrorHandler;