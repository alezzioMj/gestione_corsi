"use client";

import React, { useState } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, IconButton, Typography,
    Box, CircularProgress, TextField, Divider, Snackbar, Alert,
    MenuItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AttachmentIcon from "@mui/icons-material/Attachment";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { ApiErrorData } from "@progetto/shared/validation/types";
import { Modulo } from "@progetto/shared/validation/types";
import { API_BASE_URL } from "@/lib/config";
import { CATEGORIE_MATERIALE, Materiale } from "@progetto/shared/validation/materiale.schema";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";

interface ModuloMaterialeAssociation {
    materiale_id: string;
    modulo_id: number;
    materiale: Materiale; // Nested material object
}

const EMPTY_FORM = { titolo: "", categoria: "", descrizione: "" };

export default function ManageMaterialiModal({ modulo }: { modulo: Modulo }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const { data: materialiAssociati, isLoading, error, mutate } = useSWR(`${API_BASE_URL}/moduli/${modulo.id}/materiali`, fetcher);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setLoading(true);
        try {
            const dataMateriale = new FormData();
            dataMateriale.append("titolo", formData.titolo.trim());
            dataMateriale.append("descrizione", formData.descrizione.trim());
            dataMateriale.append("categoria", formData.categoria);
            dataMateriale.append("file", selectedFile);


            const res = await fetch(`${API_BASE_URL}/moduli/${modulo.id}/completo`, {
                method: "POST",
                body: dataMateriale,
            });

            if (!res.ok) {
                const errorData: ApiErrorData | null = await res.json().catch(() => null);
                const msg = errorData?.issues
                    ? errorData.issues.map((i) => i.message).join(", ")
                    : errorData?.error ||
                    (res.status === 413
                        ? "Il file è troppo grande"
                        : "Impossibile caricare il file");
                throw new Error(msg);
            }
            mutate();
        } catch (error: unknown) {
            console.error("Errore durante l'upload:", error);
            setSnackbar({
                open: true,
                message: error instanceof Error ? error.message : "Errore sconosciuto durante l'upload",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };
    /*
    const handleRemove = async (materiale_id: number) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/moduli/${modulo.id}/materiali/${materiale_id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchData();
                setSnackbar({ open: true, message: "Materiale rimosso con successo!", severity: "success" });
            } else {
                const errorData = await res.json();
                const msg = errorData.message || `Errore nella rimozione: ${res.statusText}`;
                throw new Error(msg);
            }
        } catch (error: unknown) {
            console.error("Errore nella rimozione:", error);
            setSnackbar({
                open: true,
                message: error instanceof Error ? error.message : "Errore sconosciuto durante la rimozione",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };
    */
    return (
        <>
            <Button variant="contained" size="small" startIcon={<AttachmentIcon />} onClick={() => setOpen(true)}>
                Materiali
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>Gestione Materiali: {modulo.titolo}</DialogTitle>
                <DialogContent dividers>
                    {/* Lista Materiali Associati in alto */}
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        MATERIALI GIÀ ASSOCIATI
                    </Typography>

                    {loading && materialiAssociati.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>
                    ) : (
                        <List dense sx={{ mb: 2 }}>
                            {materialiAssociati?.length > 0 ? (
                                materialiAssociati.map((ma: ModuloMaterialeAssociation) => (
                                    <ListItem key={ma.materiale_id} secondaryAction={
                                        <IconButton edge="end" color="error" onClick={() => /*handleRemove(ma.materiale_id)*/ null} disabled={loading}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }>
                                        <ListItemText
                                            primary={ma.materiale?.titolo}
                                            secondary={ma.materiale?.descrizione}
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                    Nessun materiale associato.
                                </Typography>
                            )}
                        </List>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Form di Upload in basso */}
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        CARICA NUOVO MATERIALE
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
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

                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadFileIcon />}
                                size="small"
                                sx={{ flexShrink: 0 }}
                            >
                                Seleziona File
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                />
                            </Button>
                            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {selectedFile ? selectedFile.name : "Nessun file selezionato"}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={loading || !selectedFile}
                            startIcon={<AddIcon />}
                        >
                            Carica e Associa
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpen(false)}>Chiudi</Button></DialogActions>
            </Dialog>

            {/* Snackbar per feedback success/error */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}