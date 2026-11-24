export interface ApiError {
    status: string;
    message: string;
    code?: string;
}

export const getErrorMessage = (error: unknown): string => {
    const data = error as ApiError;

    const errorMessages: Record<string, string> = {
        DUPLICATE_ENTRY: "Questo valore è già presente.",
        INVALID_REFERENCE: "Riferimento non valido.",
        RECORD_NOT_FOUND: "Elemento non trovato.",
        DATABASE_ERROR: "Errore durante l'accesso al database.",
        INTERNAL_ERROR: "Si è verificato un errore imprevisto.",
    };

    return (
        errorMessages[data.code ?? ""] ?? "Si è verificato un errore. Riprova."
    );
};