"use client";

import React, { useState, useRef } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, CircularProgress,
    Box, Typography, Divider, MenuItem, Snackbar, Alert,
    FormControlLabel, Checkbox
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { API_BASE_URL } from "@/lib/config";

interface AddModuloModalProps {
    onModuloAdded?: () => void;
}

const COMPETENZE_ENUM = ["Teorica", "Trasversale", "Pratica"];

export default function AddModuloModal({ onModuloAdded }: AddModuloModalProps) {
    const [formData, setFormData] = useState({
        titolo: "",
        competenza: "",
        descrizioneMateriale: "",
        multiplo: false
    });
    const [file, setFile] = useState<File | null>(null);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setFormData({
            titolo: "",
            competenza: "",
            descrizioneMateriale: "",
            multiplo: false
        });
        setFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setSnackbar({ open: true, message: "Per favore, seleziona un file.", severity: "error" });
            return;
        }

        setSubmitting(true);

        try {
            const data = new FormData();
            data.append("titolo", formData.titolo);
            data.append("competenza", formData.competenza);
            data.append("descrizioneMateriale", formData.descrizioneMateriale);
            data.append("multiplo", String(formData.multiplo)); // <--- Inviato come stringa ("true"/"false")
            data.append("file", file);

            const res = await fetch(`${API_BASE_URL}/moduli/completo`, {
                method: "POST",
                body: data,
            });

            if (res.ok) {
                if (onModuloAdded) onModuloAdded();
                handleClose();
            } else {
                const errorData = await res.json();
                const msg = errorData.issues
                    ? errorData.issues.map((i: any) => i.message).join(", ")
                    : (errorData.error || errorData.message || "Impossibile creare il modulo");
                throw new Error(msg);
            }
        } catch (error: unknown) {
            setSnackbar({
                open: true,
                message: error instanceof Error ? error.message : "Errore di rete",
                severity: "error"
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                Aggiungi Modulo e Materiale
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Nuovo Modulo Formativo Completo</DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

                            <Typography variant="subtitle2" color="primary">Informazioni Modulo</Typography>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Titolo" fullWidth required
                                    value={formData.titolo}
                                    onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                                />
                            </Box>

                            <TextField
                                select
                                label="Livello Competenza"
                                fullWidth
                                required
                                value={formData.competenza}
                                onChange={(e) => setFormData({ ...formData, competenza: e.target.value })}
                                helperText="Seleziona il livello di competenza del modulo"
                            >
                                {COMPETENZE_ENUM.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Checkbox per il campo "multiplo" */}
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

                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" color="primary">Upload Materiale Didattico</Typography>

                            <TextField
                                label="Nota sul Materiale (opzionale)" fullWidth
                                placeholder="Esempio: Slide della prima lezione"
                                value={formData.descrizioneMateriale}
                                onChange={(e) => setFormData({ ...formData, descrizioneMateriale: e.target.value })}
                            />

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    p: 3,
                                    textAlign: 'center',
                                    borderRadius: 2,
                                    bgcolor: 'action.hover',
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                        bgcolor: 'action.selected'
                                    }
                                }}
                            >
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".pdf,.ppt,.pptx,.zip,.docx"
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{ mb: 1 }}
                                >
                                    Seleziona File
                                </Button>
                                {file ? (
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </Typography>
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        Trascina qui o clicca per caricare le slide (PDF, PPT, ZIP)
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={handleClose} color="inherit">Annulla</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting || !formData.titolo || !file}
                            sx={{ minWidth: '120px' }}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : "Crea Modulo"}
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