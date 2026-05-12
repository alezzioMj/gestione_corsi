"use client";

import React, { useState, useEffect } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, IconButton, Typography,
    Box, CircularProgress, TextField, Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AttachmentIcon from "@mui/icons-material/Attachment";
import UploadFileIcon from "@mui/icons-material/UploadFile"; // New icon for upload
import { API_BASE_URL } from "@/lib/config";

// Define a more specific type for Modulo and Materiale if available
interface Modulo {
    id: number;
    titolo: string;
    // ... other properties
}

interface Materiale {
    id: number; // Added id for the material
    file_name: string; // Actual file name from backend
    url: string;
    tipo: string;
    descrizione?: string;
}

interface ModuloMaterialeAssociation {
    materiale_id: number;
    modulo_id: number;
    materiale: Materiale; // Nested material object
}

export default function ManageMaterialiModal({ modulo }: { modulo: Modulo }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [materialiAssociati, setMaterialiAssociati] = useState<ModuloMaterialeAssociation[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileDescription, setFileDescription] = useState<string>(""); // State for file description

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Materiali già associati al modulo
            const resAssoc = await fetch(`${API_BASE_URL}/moduli/${modulo.id}/materiali`);
            if (resAssoc.ok) {
                const data: ModuloMaterialeAssociation[] = await resAssoc.json();
                setMaterialiAssociati(data);
            } else {
                setMaterialiAssociati([]);
            }
        } catch (error) {
            console.error("Errore fetch materiali:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchData();
    }, [open]);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setLoading(true);
        try {
            // Step 1: Upload the file and create a Materiale entry
            const uploadFormData = new FormData();
            uploadFormData.append("file", selectedFile); // The actual file
            if (fileDescription) {
                uploadFormData.append("descrizione", fileDescription);
            }

            // Assuming a new endpoint for file upload and material creation
            const uploadRes = await fetch(`${API_BASE_URL}/materiali/upload`, {
                method: "POST",
                body: uploadFormData,
            });

            if (!uploadRes.ok) {
                throw new Error("Errore durante il caricamento del file.");
            }
            const newMateriale = await uploadRes.json(); // Expecting the created Materiale object with an ID

            // Step 2: Associate the newly created Materiale with the current Modulo
            const associateRes = await fetch(`${API_BASE_URL}/moduli/${modulo.id}/materiali`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ materiale_id: newMateriale.id }),
            });

            if (associateRes.ok) {
                await fetchData();
                setSelectedFile(null);
                setFileDescription("");
            }
        } catch (error) {
            console.error("Errore durante l'upload:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (materiale_id: number) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/moduli/${modulo.id}/materiali/${materiale_id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchData();
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <>
            <Button variant="contained" size="small" startIcon={<AttachmentIcon />} onClick={() => setOpen(true)}>
                Materiali
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
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
                            {materialiAssociati.length > 0 ? (
                                materialiAssociati.map((ma) => (
                                    <ListItem key={ma.materiale_id} secondaryAction={
                                        <IconButton edge="end" color="error" onClick={() => handleRemove(ma.materiale_id)} disabled={loading}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }>
                                        <ListItemText 
                                            primary={ma.materiale?.file_name} 
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                        {selectedFile && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Descrizione (opzionale)"
                                    size="small"
                                    value={fileDescription}
                                    onChange={(e) => setFileDescription(e.target.value)}
                                />
                            </>
                        )}
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
        </>
    );
}