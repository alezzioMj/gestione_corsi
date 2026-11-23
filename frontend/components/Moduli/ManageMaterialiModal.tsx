
"use client";

import React, { useRef, useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Typography,
    Box,
    CircularProgress,
    TextField,
    Divider,
    MenuItem
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AttachmentIcon from "@mui/icons-material/Attachment";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { Modulo } from "@progetto/shared/validation/modulo.schema";
import {
    CATEGORIE_MATERIALE,
    Materiale
} from "@progetto/shared/validation/materiale.schema";

import { API_BASE_URL } from "@/lib/config";
import { useSnackbar } from "../SnackbarContext";
import { useConfirm } from "../ConfirmContext";
import { getErrorMessage } from "@/utils/errorMessages";

import useSWR from "swr";

// Tipi

interface ModuloMaterialeAssociation {
    materiale_id: string;
    modulo_id: number;
    materiale: Materiale;
}

const EMPTY_FORM = {
    titolo: "",
    categoria: "",
    descrizione: ""
};

// Gestione sicura delle risposte HTTP

async function getResponseError(res: Response): Promise<string> {
    const contentType = res.headers.get("content-type");

    if (contentType?.includes("application/json")) {
        const data = await res.json().catch(() => null);

        return (
            data?.message ||
            data?.error ||
            `Errore HTTP ${res.status}`
        );
    }

    const text = await res.text().catch(() => "");

    return text || `Errore HTTP ${res.status}`;
}

// Fetcher SWR

async function fetchMateriali(
    url: string
): Promise<ModuloMaterialeAssociation[]> {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(await getResponseError(res));
    }

    const data = await res.json().catch(() => null);

    if (!Array.isArray(data)) {
        throw new Error("Risposta non valida dal server");
    }

    return data;
}

// Componente

export default function ManageMaterialiModal({
    modulo
}: {
    modulo: Modulo
}) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { showMessage } = useSnackbar();
    const { confirm } = useConfirm();

    // Recupero materiali associati

    const {
        data: materialiAssociati = [],
        isLoading: isLoadingMateriali,
        error,
        mutate
    } = useSWR<ModuloMaterialeAssociation[]>(
        open
            ? `${API_BASE_URL}/moduli/${modulo.id}/materiali`
            : null,
        fetchMateriali,
        {
            fallbackData: []
        }
    );

    // Reset form e file

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Upload e associazione materiale

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);

        try {
            // Recupero metadati esistenti

            const resMateriali = await fetch(
                `${API_BASE_URL}/materiali/metadata`
            );

            if (!resMateriali.ok) {
                throw new Error(
                    await getResponseError(resMateriali)
                );
            }

            const materiali: Materiale[] = await resMateriali
                .json()
                .catch(() => {
                    throw new Error(
                        "Risposta non valida dal server"
                    );
                });

            if (!Array.isArray(materiali)) {
                throw new Error(
                    "Formato dei metadati non valido"
                );
            }

            // Calcolo checksum SHA-256

            const arrayBuffer = await selectedFile.arrayBuffer();

            const hashBuffer = await crypto.subtle.digest(
                "SHA-256",
                arrayBuffer
            );

            const checksum = Array.from(
                new Uint8Array(hashBuffer)
            )
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");

            // Verifica duplicati

            const materialeDuplicato = materiali.find(
                m => m.checksum === checksum
            );

            if (materialeDuplicato) {
                const ok = await confirm({
                    message: `Il materiale è già presente come ${materialeDuplicato.titolo}. Desideri aggiungere questo materiale al modulo?`,
                    confirmColor: "primary"
                });

                if (!ok) return;

                const res = await fetch(
                    `${API_BASE_URL}/moduli/${modulo.id}/materiali`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            materiale_id: materialeDuplicato.id
                        })
                    }
                );

                if (!res.ok) {
                    throw new Error(
                        await getResponseError(res)
                    );
                }

                await mutate();

                resetForm();

                showMessage(
                    "Materiale associato correttamente",
                    "success"
                );

                return;
            }

            // Creazione nuovo materiale

            const dataMateriale = new FormData();

            dataMateriale.append(
                "titolo",
                formData.titolo.trim()
            );

            dataMateriale.append(
                "descrizione",
                formData.descrizione.trim()
            );

            dataMateriale.append(
                "categoria",
                formData.categoria
            );

            dataMateriale.append(
                "file",
                selectedFile
            );

            const res = await fetch(
                `${API_BASE_URL}/moduli/${modulo.id}/completo`,
                {
                    method: "POST",
                    body: dataMateriale
                }
            );

            if (!res.ok) {
                throw new Error(
                    await getResponseError(res)
                );
            }

            await mutate();

            resetForm();

            showMessage(
                "Materiale caricato correttamente",
                "success"
            );

        } catch (error: unknown) {
            console.error(error);

            showMessage(
                getErrorMessage(error),
                "error"
            );

        } finally {
            setLoading(false);
        }
    };

    // Rendering

    return (
        <>
            <Button
                variant="contained"
                size="small"
                startIcon={<AttachmentIcon />}
                onClick={() => setOpen(true)}
            >
                Materiali
            </Button>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    Gestione Materiali: {modulo.titolo}
                </DialogTitle>

                <DialogContent dividers>

                    {/* Materiali associati */}

                    <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                            fontWeight: "bold",
                            color: "primary.main"
                        }}
                    >
                        MATERIALI GIÀ ASSOCIATI
                    </Typography>

                    {isLoadingMateriali ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                p: 3
                            }}
                        >
                            <CircularProgress size={24} />
                        </Box>
                    ) : error ? (
                        <Typography
                            color="error"
                            variant="body2"
                        >
                            Errore nel recupero dei materiali:{" "}
                            {getErrorMessage(error)}
                        </Typography>
                    ) : (
                        <List dense sx={{ mb: 2 }}>
                            {materialiAssociati.length > 0 ? (
                                materialiAssociati.map(ma => (
                                    <ListItem
                                        key={ma.materiale_id}
                                    >
                                        <ListItemText
                                            primary={ma.materiale?.titolo}
                                            secondary={ma.materiale?.descrizione}
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        py: 2,
                                        textAlign: "center"
                                    }}
                                >
                                    Nessun materiale associato.
                                </Typography>
                            )}
                        </List>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Form upload */}

                    <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                            fontWeight: "bold",
                            color: "primary.main"
                        }}
                    >
                        CARICA NUOVO MATERIALE
                    </Typography>

                    <Box
                        sx={{
                            mt: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2
                            }}
                        >
                            <TextField
                                select
                                required
                                label="Tipo di materiale"
                                fullWidth
                                value={formData.categoria}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        categoria: e.target.value
                                    })
                                }
                                helperText="Seleziona il tipo di materiale caricato"
                            >
                                {CATEGORIE_MATERIALE.map(type => (
                                    <MenuItem
                                        value={type}
                                        key={type}
                                    >
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                required
                                label="Titolo del materiale"
                                placeholder="Esempio: Slide della prima lezione"
                                fullWidth
                                value={formData.titolo}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        titolo: e.target.value
                                    })
                                }
                            />

                            <TextField
                                label="Descrizione"
                                fullWidth
                                value={formData.descrizione}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        descrizione: e.target.value
                                    })
                                }
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
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    onChange={(e) =>
                                        setSelectedFile(
                                            e.target.files?.[0] || null
                                        )
                                    }
                                />
                            </Button>

                            <Typography
                                variant="body2"
                                sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {selectedFile
                                    ? selectedFile.name
                                    : "Nessun file selezionato"}
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={
                                loading ||
                                !selectedFile ||
                                !formData.titolo.trim() ||
                                !formData.categoria
                            }
                            startIcon={
                                loading
                                    ? <CircularProgress size={18} color="inherit" />
                                    : <AddIcon />
                            }
                        >
                            {loading
                                ? "Caricamento..."
                                : "Carica e Associa"}
                        </Button>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Chiudi
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
