import React from "react";
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Box,
} from "@mui/material";

type DialogSize = "xs" | "sm" | "md" | "lg";

interface EntityDialogProps {
    open: boolean;
    onClose: () => void;
    size?: DialogSize;
    children: React.ReactNode;
}

/** Solo contenitore: lo stato sta nei figli, che MUI smonta alla chiusura. */
export function EntityDialog({ open, onClose, size = "md", children }: EntityDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={size}>
            {children}
        </Dialog>
    );
}

interface EntityFormShellProps {
    title: string;
    submitLabel?: string;
    submitting: boolean;
    canSubmit?: boolean;
    onSubmit: () => void | Promise<void>;
    onClose: () => void;
    children: React.ReactNode;
}

export function EntityFormShell({
    title, submitLabel = "Salva", submitting, canSubmit = true, onSubmit, onClose, children,
}: EntityFormShellProps) {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
                    {children}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} color="inherit" disabled={submitting}>Annulla</Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting || !canSubmit}
                    sx={{ minWidth: "120px" }}
                >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : submitLabel}
                </Button>
            </DialogActions>
        </form>
    );
}