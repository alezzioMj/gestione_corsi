"use client";

import React, { useState, useRef } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, CircularProgress,
    Box, Typography, Divider, MenuItem,
    FormControlLabel, Checkbox
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { CreateModulo, Modulo } from "@progetto/shared/validation/modulo.schema";

const COMPETENZE_ENUM = ["Teorica", "Trasversale", "Pratica"] as const;
type Competenza = (typeof COMPETENZE_ENUM)[number];

type ModuloFormData = Omit<CreateModulo, "competenza"> & {
    competenza: Competenza | "";
    descrizioneMateriale: string;
};

const INITIAL_FORM: ModuloFormData = {
    titolo: "",
    competenza: "",
    descrizioneMateriale: "",
    n_ore: 4,
    multiplo: false,
};

interface AddModuloModalProps {
    onModuloAdded?: () => void;
}

export default function AddModuloModal({ onModuloAdded }: AddModuloModalProps) {
    const [open, setOpen] = useState(false);
    // Cambia a ogni apertura: il form interno si rimonta con stato pulito
    const [formKey, setFormKey] = useState(0);

    const handleOpen = () => {
        setFormKey((k) => k + 1);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSuccess = () => {
        onModuloAdded?.();
        handleClose();
    };

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                Aggiungi Modulo e Materiale
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <AddModuloForm
                    key={formKey}
                    onClose={handleClose}
                    onSuccess={handleSuccess}
                />
            </Dialog>
        </>
    );
}

interface AddModuloFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

function AddModuloForm({ onClose, onSuccess }: AddModuloFormProps) {
    const [formData, setFormData] = useState<ModuloFormData>(INITIAL_FORM);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { submitting, create } = useCreateEntity<FormData, Modulo>("/moduli");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) setFile(selected);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData();
        data.append("titolo", formData.titolo);
        data.append("competenza", formData.competenza);
        data.append("n_ore", String(formData.n_ore));
        data.append("descrizioneMateriale", formData.descrizioneMateriale);
        data.append("multiplo", String(formData.multiplo));
        if (file) {
            data.append("file", file);
        }

        const ok = await create(data);
        if (ok) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogTitle>Nuovo Modulo Formativo Completo</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>

                    <Typography variant="subtitle2" color="primary">Informazioni Modulo</Typography>

                    <TextField
                        label="Titolo"
                        fullWidth
                        required
                        value={formData.titolo}
                        onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                    />

                    <TextField
                        select
                        label="Livello Competenza"
                        fullWidth
                        required
                        value={formData.competenza}
                        onChange={(e) =>
                            setFormData({ ...formData, competenza: e.target.value as Competenza })
                        }
                        helperText="Seleziona il livello di competenza del modulo"
                    >
                        {COMPETENZE_ENUM.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
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

                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="primary">Upload Materiale Didattico</Typography>

                    <TextField
                        label="Nota sul Materiale (opzionale)"
                        fullWidth
                        placeholder="Esempio: Slide della prima lezione"
                        value={formData.descrizioneMateriale}
                        onChange={(e) => setFormData({ ...formData, descrizioneMateriale: e.target.value })}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px dashed",
                            borderColor: "divider",
                            p: 3,
                            textAlign: "center",
                            borderRadius: 2,
                            bgcolor: "action.hover",
                            transition: "background-color 0.2s",
                            "&:hover": { bgcolor: "action.selected" },
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
                            <Typography variant="body2" sx={{ color: "success.main", fontWeight: "bold" }}>
                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </Typography>
                        ) : (
                            <Typography variant="caption" color="text.secondary">
                                Clicca per caricare le slide (PDF, PPT, DOCX, ZIP)
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} color="inherit">Annulla</Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting || !formData.titolo || !formData.competenza}
                    sx={{ minWidth: "120px" }}
                >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Crea Modulo"}
                </Button>
            </DialogActions>
        </form>
    );
}