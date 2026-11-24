import React from "react";
import { Alert, Button } from "@mui/material";
import DelayedLoading from "@/components/DelayedLoading";

interface AsyncContentProps<T> {
    data: T | undefined;
    error?: Error;
    onRetry?: () => void;
    /** Elemento da mostrare quando non ci sono dati (di default: array vuoto) */
    empty: React.ReactNode;
    isEmpty?: (data: T) => boolean;
    children: (data: T) => React.ReactNode;
}

export default function AsyncContent<T>({
    data,
    error,
    onRetry,
    empty,
    isEmpty = (d) => Array.isArray(d) && d.length === 0,
    children,
}: AsyncContentProps<T>) {
    if (error) {
        return (
            <Alert
                severity="error"
                sx={{ mb: 4 }}
                action={
                    onRetry && (
                        <Button color="inherit" size="small" onClick={onRetry}>
                            Riprova
                        </Button>
                    )
                }
            >
                {error.message}
            </Alert>
        );
    }

    if (data === undefined) return <DelayedLoading />;
    if (isEmpty(data)) return <>{empty}</>;

    return <>{children(data)}</>;
}