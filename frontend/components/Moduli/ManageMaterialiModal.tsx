"use client";

import React, { useState } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, IconButton, Typography,
    Box, CircularProgress, TextField, Divider,
    MenuItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AttachmentIcon from "@mui/icons-material/Attachment";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { Modulo } from "@progetto/shared/validation/modulo.schema";
import { API_BASE_URL } from "@/lib/config";
import { CATEGORIE_MATERIALE, Materiale } from "@progetto/shared/validation/materiale.schema";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { useSnackbar } from "../SnackbarContext";
import { useConfirm } from "../ConfirmContext";
import { getErrorMessage } from "@/utils/errorMessages";

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
    const { showMessage } = useSnackbar();
    const { confirm } = useConfirm();
    const { data: materialiAssociati, isLoading, error, mutate } = useSWR(`${API_BASE_URL}/moduli/${modulo.id}/materiali`, fetcher);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setLoading(true);
        try {
            const resMateriali = await fetch(`${API_BASE_URL}/materiali/metadata`, {
                method: "GET"
            });
            if (!resMateriali.ok) {
                const errorData = await resMateriali.json().catch(() => null);
                throw new Error(errorData.message);
            }
            const materiali: Materiale[] = await resMateriali.json();

            const arrayBuffer = await selectedFile.arrayBuffer();

            const hashBuffer = await crypto.subtle.digest(
                "SHA-256",
                arrayBuffer
            );
            const checksum = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");

            const materialeDuplicato = materiali.find(
                m => m.checksum === checksum
            )

            if (materialeDuplicato) {
                const ok = await confirm({
                    message: `Il materiale è già presente come ${materialeDuplicato.titolo}. Desideri aggiungere questo materiale al modulo?`,
                    confirmColor: "primary"
                }
                );
                if (ok) {
                    const res = await fetch(`${API_BASE_URL}/moduli/${modulo.id}/materiali`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            materiale_id: materialeDuplicato.id
                        }),
                    });
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.message);
                    }
                    mutate();
                }
                return;
            }

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
                const errorData = await res.json().catch(() => null);;
                throw new Error(errorData.message);
            }
            mutate();
        } catch (error: unknown) {
            console.error(error);
            showMessage(getErrorMessage(error), "error")
        } finally {
            setLoading(false);
        }
    };

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
        </>
    );
}