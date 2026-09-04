"use client";

import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box, 
    MenuItem,
    Snackbar,
    Alert,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { API_BASE_URL } from "@/lib/config";
import { ApiErrorData } from "@/validation/types";

interface EditModuloModalProps {
    open: boolean;
    onClose: () => void;
    modulo: { 
        id: number; 
        titolo: string; 
        competenza: string; 
        descrizione?: string;
        multiplo?: boolean | string; // <--- Può arrivare come boolean o stringa dal DB
    };
    onSaveSuccess: () => void;
}

const COMPETENZE_ENUM = ["Teorica", "Trasversale", "Pratica"];

export default function EditModuloModal({ open, onClose, modulo, onSaveSuccess }: EditModuloModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titolo: "",
        descrizione: "",
        competenza: "",
        multiplo: false,
    });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        if (modulo) {
            // Conversione sicura per evitare che "false" (stringa) o undefined resettino lo stato
            const isMultiplo = typeof modulo.multiplo === "string" 
                ? modulo.multiplo === "true" 
                : Boolean(modulo.multiplo);

            setFormData({
                titolo: modulo.titolo || "",
                descrizione: modulo.descrizione || "",
                competenza: modulo.competenza || "",
                multiplo: isMultiplo, // <--- Prende il valore reale salvato sul modulo
            });
        }
    }, [modulo, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!modulo?.id) {
            setSnackbar({ open: true, message: "ID Modulo non valido", severity: "error" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/moduli/${modulo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    n_ore: 4 // Passa la chiave corretta attesa dal backend
                }),
            });

            if (res.ok) {
                onSaveSuccess();
                onClose();
            } else {
                const errorData : ApiErrorData = await res.json();
                const msg = errorData.issues 
                    ? errorData.issues.map((i) => `${i.path?.join('.')}: ${i.message}`).join(", ")
                    : (errorData.error || "Errore durante l'aggiornamento");
                throw new Error(msg);
            }
        } catch (err: unknown) {
            setSnackbar({ 
                open: true, 
                message: err instanceof Error ? err.message : "Errore di rete", 
                severity: "error" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <form onSubmit={handleSubmit}>
                <DialogTitle>Modifica Modulo</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField 
                            label="Titolo Modulo" fullWidth required 
                            value={formData.titolo} 
                            onChange={(e) => setFormData({ ...formData, titolo: e.target.value })} 
                        />
                        
                        <TextField
                            select
                            label="Livello Competenza"
                            fullWidth
                            required
                            value={formData.competenza}
                            onChange={(e) => setFormData({ ...formData, competenza: e.target.value })}
                        >
                            {COMPETENZE_ENUM.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.multiplo}
                                    onChange={(e) => setFormData({ ...formData, multiplo: e.target.checked })}
                                    color="primary"
                                />
                            }
                            label="Modulo Multiplo"
                        />

                        <TextField 
                            label="Descrizione" 
                            fullWidth 
                            multiline 
                            rows={4} 
                            value={formData.descrizione || ""} 
                            onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })} 
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Annulla</Button>
                    <Button type="submit" variant="contained" startIcon={<EditIcon />} disabled={loading}>
                        {loading ? "Salvataggio..." : "Salva Modifiche"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>

        <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
                {snackbar.message}
            </Alert>
        </Snackbar>
        </>
    );
}