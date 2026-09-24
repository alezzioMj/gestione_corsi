import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle } from "@mui/material";

interface FormDialogProps {
    open: boolean;
    title: string;
    submitting?: boolean;
    maxWidth?: DialogProps["maxWidth"];
    onClose: () => void;
    onSubmit: (e: React.SubmitEvent) => void;
    children: React.ReactNode;
}

export default function FormDialog(
    { open, title, submitting = false, maxWidth = "sm", onClose, onSubmit, children }: FormDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
            <form onSubmit={onSubmit}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        {children}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Annulla</Button>
                    <Button type="submit" variant="contained" disabled={submitting}>
                        {submitting ? <CircularProgress size={24} /> : "Salva"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

