"use client";

import React, { useState, useRef } from "react";
import {
    Button, TextField, Box, Typography, Divider, MenuItem,
    FormControlLabel, Checkbox, IconButton
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useUpdateEntity } from "@/hooks/useUpdateEntity";
import { EntityDialog, EntityFormShell } from "@/components/common/EntityFormShell";

import {
    COMPETENZE,
    type Competenza,
    type CreateModulo,
    type Modulo,
} from "@progetto/shared/validation/modulo.schema";

type ModuloFormData = Omit<CreateModulo, "competenza" | "file"> & {
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

function toFormData(modulo?: Modulo | null): ModuloFormData {
    if (!modulo) return INITIAL_FORM;
    return {
        titolo: modulo.titolo,
        competenza: modulo.competenza,
        descrizioneMateriale: "",
        n_ore: modulo.n_ore ?? 4,
        multiplo: modulo.multiplo,
    };
}

interface ModuloModalProps {
    open: boolean;
    modulo?: Modulo | null;
    onClose: () => void;
    /** La pagina si occupa di mutate() e di chiudere il dialog */
    onSuccess: () => void;
}

export default function ModuloModal({ open, modulo, onClose, onSuccess }: ModuloModalProps) {
    return (
        <EntityDialog open={open} onClose={onClose} size="md">
            <ModuloForm
                key={modulo?.id ?? "new"}
                modulo={modulo}
                onClose={onClose}
                onSuccess={onSuccess}
            />
        </EntityDialog>
    );
}

interface ModuloFormProps {
    modulo?: Modulo | null;
    onClose: () => void;
    onSuccess: () => void;
}

function ModuloForm({ modulo, onClose, onSuccess }: ModuloFormProps) {
    const [formData, setFormData] = useState<ModuloFormData>(() => toFormData(modulo));
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { submitting: creating, create } = useCreateEntity<FormData, Modulo>("/moduli");
    const { submitting: updating, update } = useUpdateEntity<FormData, Modulo>("/moduli");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        setFiles((prev) => {
            // evita duplicati (stesso nome e dimensione)
            const fresh = selected.filter(
                (f) => !prev.some((p) => p.name === f.name && p.size === f.size)
            );
            return [...prev, ...fresh];
        });
        e.target.value = ""; // permette di riselezionare lo stesso file
    };

    const removeFile = (index: number) =>
        setFiles((prev) => prev.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        const data = new FormData();
        data.append("titolo", formData.titolo);
        data.append("competenza", formData.competenza);
        data.append("n_ore", String(formData.n_ore ?? 4));
        data.append("descrizioneMateriale", formData.descrizioneMateriale);
        data.append("multiplo", String(formData.multiplo));
        files.forEach((f) => data.append("file", f));

        const ok = modulo ? await update(modulo.id, data) : await create(data);
        if (ok) onSuccess();
    };

    return (
        <EntityFormShell
            title={modulo ? "Modifica Modulo" : "Nuovo Modulo"}
            submitLabel={modulo ? "Salva Modifiche" : "Crea Modulo"}
            submitting={creating || updating}
            canSubmit={!!formData.titolo && !!formData.competenza}
            onSubmit={handleSubmit}
            onClose={onClose}
        >
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
                {COMPETENZE.map((option) => (
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
            <Typography variant="subtitle2" color="primary">
                {modulo ? "Aggiungi Materiale Didattico (opzionale)" : "Upload Materiale Didattico"}
            </Typography>

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
                    multiple
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

                {files.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                        {modulo
                            ? "Lascia vuoto per mantenere il materiale attuale"
                            : "Puoi caricare più file (PDF, PPT, DOCX, ZIP)"}
                    </Typography>
                ) : (
                    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {files.map((f, i) => (
                            <Box
                                key={`${f.name}-${f.size}`}
                                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}
                            >
                                <Typography variant="body2" noWrap sx={{ color: "success.main", fontWeight: "bold" }}>
                                    {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                                </Typography>
                                <IconButton size="small" aria-label={`Rimuovi ${f.name}`} onClick={() => removeFile(i)}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </EntityFormShell>
    );
}