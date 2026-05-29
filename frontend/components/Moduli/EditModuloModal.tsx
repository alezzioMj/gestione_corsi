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
    Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { API_BASE_URL } from "@/lib/config";

interface EditModuloModalProps {
    open: boolean;
    onClose: () => void;
    modulo: { id: number; titolo: string; ore: number; competenza: string; descrizione?: string }; // More specific type
    onSaveSuccess: () => void;
}

const COMPETENZE_ENUM = ["Teorica", "Trasversale", "Pratica"]; // Re-use enum

export default function EditModuloModal({ open, onClose, modulo, onSaveSuccess }: EditModuloModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titolo: "", // Changed from nome to titolo
        descrizione: "",
        ore: 0,
        competenza: "", // Added competenza
    });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        if (modulo) {
            setFormData({
                titolo: modulo.titolo || "", // Changed from nome to titolo
                descrizione: modulo.descrizione || "",
                ore: modulo.ore || 0,
                competenza: modulo.competenza || "",
            });
        }
    }, [modulo, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/moduli/${modulo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    ore: Number(formData.ore), // Ensure ore is sent as a number
                }),
            });

            if (res.ok) {
                onSaveSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                const msg = errorData.issues 
                    ? errorData.issues.map((i: any) => i.message).join(", ")
                    : (errorData.error || errorData.message || "Errore durante l'aggiornamento");
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
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
                            label="Ore" type="number" fullWidth required 
                            value={formData.ore} 
                            onChange={(e) => setFormData({ ...formData, ore: Number(e.target.value) })} 
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
                        <TextField label="Descrizione" fullWidth multiline rows={4} value={formData.descrizione || ""} onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })} />
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