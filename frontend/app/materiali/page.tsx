"use client";

import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert, Container, Snackbar, TextField} from "@mui/material"; 
import React, { useState, useRef } from "react";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import useSWR from 'swr';
import DelayedLoading from "@/components/DelayedLoading";
import { fetcher } from "@/lib/swr-config";
import { ApiErrorData } from "@shared/validation/types";
import { API_ENDPOINTS } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";

// Definizione di un tipo base per un materiale
interface Materiale {
    id: number;
    url: string;
    file_name: string;
    tipo: string;
    descrizione?: string;
}

export default function MaterialiPage() {

    const { data: materiali, error, isLoading, mutate } = useSWR(API_ENDPOINTS.materiali, fetcher);
    const [openInfoModal, setOpenInfoModal] = useState(false);
    const [selectedMaterialeInfo, setSelectedMaterialeInfo] = useState<Materiale | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(false);
    const [infoError, setInfoError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileDescription, setFileDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleConfirmDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/materiali/${deleteConfirm.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData : ApiErrorData = await res.json();
                const msg = errorData.issues 
                    ? errorData.issues.map((i) => i.message).join(", ")
                    : (errorData.error || `Errore: ${res.statusText}`);
                throw new Error(msg);
            }
            mutate();
            setSnackbar({ open: true, message: "Materiale eliminato con successo!", severity: 'success' });
        } catch (error: unknown) {
            setSnackbar({ 
                open: true, 
                message: error instanceof Error ? error.message : 'Errore nell\'eliminazione', 
                severity: 'error' 
            });
        } finally {
            setDeleteConfirm({ open: false, id: null });
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteConfirm({ open: true, id });
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        try {
            const data = new FormData();
            data.append("file", selectedFile);
            if (fileDescription) data.append("descrizione", fileDescription);

            const res = await fetch(`${API_BASE_URL}/materiali`, {
                method: "POST",
                body: data, // Invia come FormData
            });

            if (!res.ok) {
                const errorData : ApiErrorData = await res.json();
                // Estrae i messaggi dall'array 'issues' se presenti
                const msg = errorData.issues 
                    ? errorData.issues.map((i) => i.message).join(", ")
                    : (errorData.error || "Errore nel caricamento");
                throw new Error(msg);
            }

            mutate();
            setSnackbar({ open: true, message: "Materiale caricato con successo!", severity: "success" });
            handleCloseUpload();
        } catch (error: unknown) {
            setSnackbar({ 
                open: true, 
                message: error instanceof Error ? error.message : "Errore durante l'upload", 
                severity: "error" 
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleCloseUpload = () => {
        setOpenUploadModal(false);
        setSelectedFile(null);
        setFileDescription("");
    };

    const handleOpenInfo = async (id: number) => {
        setIsLoadingInfo(true);
        setInfoError(null);
        setOpenInfoModal(true); // Apri il modal per mostrare lo stato di caricamento
        if (!id) {
            console.log("ID non disponibile.");
            return;
        }
        try {
            const res = await fetcher(`${API_ENDPOINTS.materiali}${id}`); 
            setSelectedMaterialeInfo(res);
        } catch (error: unknown) {
            console.error("Errore nel recupero info materiale:", error);
            setInfoError(error instanceof Error ? error.message : "Errore sconosciuto");
        } finally {
            setIsLoadingInfo(false);
        }
    };

    const handleCloseInfo = () => {
        setOpenInfoModal(false);
        setSelectedMaterialeInfo(null);
        setInfoError(null);
    };

    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>Gestione Materiali</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Visualizza, scarica e gestisci i materiali didattici salvati nel sistema.
                </Typography>

                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setOpenUploadModal(true)}
                    sx={{ mb: 4 }}
                >
                    Carica Nuovo Materiale
                </Button>

                {error && ( // Display SWR error
                    <Alert
                        severity="error"
                        sx={{ mb: 4 }}
                        action={
                            <Button color="inherit" size="small" onClick={() => mutate()}>
                                Riprova
                            </Button>
                        }
                    >
                        {error.message || "Errore nel caricamento dei materiali."}
                    </Alert>
                )}

                {isLoading ? ( // Use SWR's isLoading
                    <DelayedLoading />
                ) : materiali && materiali.length === 0 ? ( 
                    <Typography variant="h6" color="text.secondary">Nessun materiale trovato.</Typography>
                ) : (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 2 }}>Lista Materiali</Typography>
                        {materiali && materiali.map((materiale: Materiale) => ( 
                            <Box key={materiale.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="subtitle1">{materiale.file_name} (ID: {materiale.id})</Typography>
                                    <Typography variant="body2" color="text.secondary">{materiale.descrizione || "Nessuna descrizione"}</Typography>
                                </Box>
                                <Box>
                                    <Button variant="outlined" size="small" sx={{ mt: 1, mr: 1 }} onClick={() => handleOpenInfo(materiale.id)} startIcon={<InfoIcon />}>
                                        Info
                                    </Button>
                                    <Button variant="contained" size="small" color="primary" sx={{ mt: 1, mr: 1 }} onClick={() => handleDownload(materiale.url)}>
                                        Scarica
                                    </Button>
                                    <Button variant="outlined" color="error" size="small" sx={{ mt: 1 }} onClick={() => handleDeleteClick(materiale.id)} startIcon={<DeleteIcon />}>
                                        Elimina
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Modal per le informazioni del materiale */}
                <Dialog open={openInfoModal} onClose={handleCloseInfo} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Dettagli Materiale
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseInfo}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        {isLoadingInfo && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                                <Typography sx={{ ml: 2 }}>Caricamento informazioni...</Typography>
                            </Box>
                        )}
                        {infoError && <Typography color="error">{infoError}</Typography>}
                        {selectedMaterialeInfo && !isLoadingInfo && !infoError && (
                            <Box>
                                <Typography variant="h6" gutterBottom>{selectedMaterialeInfo.file_name}</Typography>
                                <Typography variant="body1">ID: {selectedMaterialeInfo.id}</Typography>
                                <Typography variant="body1">Tipo: {selectedMaterialeInfo.tipo}</Typography>
                                <Typography variant="body1">URL: {selectedMaterialeInfo.url}</Typography>
                                <Typography variant="body1" sx={{ mt: 2 }}>Descrizione:</Typography>
                                <Typography variant="body2">{selectedMaterialeInfo.descrizione || "Nessuna descrizione"}</Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseInfo}>Chiudi</Button>
                    </DialogActions>
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

                {/* Dialog di conferma eliminazione */}
                <Dialog
                    open={deleteConfirm.open}
                    onClose={() => setDeleteConfirm({ open: false, id: null })}
                >
                    <DialogTitle>Conferma Eliminazione</DialogTitle>
                    <DialogContent dividers>
                        {"Sei sicuro di voler eliminare questo materiale? L'azione è irreversibile."}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirm({ open: false, id: null })}>Annulla</Button>
                        <Button onClick={handleConfirmDelete} color="error" variant="contained">Elimina</Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog di caricamento materiale */}
                <Dialog open={openUploadModal} onClose={handleCloseUpload} fullWidth maxWidth="xs">
                    <DialogTitle>Carica Materiale</DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Box sx={{ textAlign: 'center', p: 3, border: '1px dashed #ccc', borderRadius: 1, bgcolor: 'action.hover' }}>
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<UploadFileIcon />}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Seleziona File
                                </Button>
                                <Typography variant="body2" sx={{ mt: 1, color: selectedFile ? 'primary.main' : 'text.secondary' }}>
                                    {selectedFile ? selectedFile.name : "Nessun file selezionato"}
                                </Typography>
                            </Box>
                            <TextField
                                label="Descrizione (opzionale)"
                                fullWidth
                                value={fileDescription}
                                onChange={(e) => setFileDescription(e.target.value)}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUpload}>Annulla</Button>
                        <Button 
                            onClick={handleUpload} 
                            variant="contained" 
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? <CircularProgress size={24} /> : "Carica"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
}