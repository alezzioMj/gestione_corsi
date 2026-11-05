'use client'

import React, { useState, useRef } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, CircularProgress,
    Box, Typography, Divider, Snackbar, Alert,
    MenuItem
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ApiErrorData } from "@progetto/shared/validation/types";
import { API_ENDPOINTS } from "@/lib/api";
import { CATEGORIE_MATERIALE } from "@progetto/shared/validation/materiale.schema";

interface AddMaterialeProps {
    onMaterialeAdded?: () => void;
}

// Deve coincidere con i controlli del backend (valore indicativo: adattalo).
const ALLOWED_EXTENSIONS = [".pdf", ".ppt", ".pptx", ".zip", ".docx"];
const MAX_FILE_MB = 50;

const EMPTY_FORM = { titolo: "", categoria: "", descrizione: "" };

type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' };

export default function AddMaterialeModal({ onMaterialeAdded }: AddMaterialeProps) {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [file, setFile] = useState<File | null>(null);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showError = (message: string) =>
        setSnackbar({ open: true, message, severity: 'error' });

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        if (submitting) return;
        setOpen(false);
        setFormData(EMPTY_FORM);
        setFile(null);
        setDragging(false);
    };

    const selectFile = (candidate: File | undefined) => {
        if (!candidate) return;

        const name = candidate.name.toLowerCase();
        if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
            showError(`Formato non supportato. Usa: ${ALLOWED_EXTENSIONS.join(", ")}`);
            return;
        }
        if (candidate.size > MAX_FILE_MB * 1024 * 1024) {
            showError(`Il file supera ${MAX_FILE_MB} MB`);
            return;
        }
        setFile(candidate);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        selectFile(e.target.files?.[0]);
        e.target.value = ""; // permette di riselezionare lo stesso file
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        selectFile(e.dataTransfer.files?.[0]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!file) {
            showError("Seleziona un file da caricare");
            return;
        }

        setSubmitting(true);

        try {
            // Nome, dimensione e tipo del file li ricava il server dal file ricevuto.
            const data = new FormData();
            data.append("titolo", formData.titolo.trim());
            data.append("descrizione", formData.descrizione.trim());
            data.append("categoria", formData.categoria);
            data.append("file", file);

            const res = await fetch(API_ENDPOINTS.materiali, {
                method: "POST",
                body: data,
                // credentials: "include", // serve se API e frontend sono su origini diverse con cookie
            });

            if (!res.ok) {
                // La risposta d'errore potrebbe non essere JSON (es. 413 da un proxy).
                const errorData: ApiErrorData | null = await res.json().catch(() => null);
                const msg = errorData?.issues
                    ? errorData.issues.map((i) => i.message).join(", ")
                    : errorData?.error ||
                      (res.status === 413
                          ? "Il file è troppo grande"
                          : "Impossibile caricare il file");
                throw new Error(msg);
            }

            onMaterialeAdded?.();
            setSubmitting(false);
            handleClose();
            setSnackbar({ open: true, message: "Materiale caricato", severity: 'success' });
        } catch (error: unknown) {
            showError(error instanceof Error ? error.message : "Errore di rete");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                Aggiungi materiale
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Nuovo materiale formativo</DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

                            <Typography variant="subtitle2" color="primary">Informazioni materiale</Typography>

                            <TextField
                                select
                                required
                                label="Tipo di materiale"
                                fullWidth
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                helperText="Seleziona il tipo di materiale caricato"
                            >
                                {CATEGORIE_MATERIALE.map((type) => (
                                    <MenuItem value={type} key={type}>{type}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                required
                                label="Titolo del materiale"
                                placeholder="Esempio: Slide della prima lezione"
                                fullWidth
                                value={formData.titolo}
                                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                            />

                            <TextField
                                label="Descrizione"
                                fullWidth
                                value={formData.descrizione}
                                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                            />

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="subtitle2" color="primary">Upload materiale didattico</Typography>
                            <Box
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed',
                                    borderColor: dragging ? 'primary.main' : 'divider',
                                    p: 3,
                                    textAlign: 'center',
                                    borderRadius: 2,
                                    bgcolor: dragging ? 'action.selected' : 'action.hover',
                                    transition: 'background-color 0.2s, border-color 0.2s',
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
                                    accept={ALLOWED_EXTENSIONS.join(",")}
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={submitting}
                                    sx={{ mb: 1 }}
                                >
                                    Seleziona file
                                </Button>
                                {file ? (
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </Typography>
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        Trascina qui un file o clicca per sceglierlo (PDF, PPT, PPTX, DOCX, ZIP, max {MAX_FILE_MB} MB)
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={handleClose} color="inherit" disabled={submitting}>
                            Annulla
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting || !file}
                            sx={{ minWidth: '120px' }}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : "Carica materiale"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}