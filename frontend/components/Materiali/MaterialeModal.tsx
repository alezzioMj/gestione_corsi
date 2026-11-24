"use client";

import React, { useState } from "react";
import { TextField, MenuItem } from "@mui/material";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { EntityDialog, EntityFormShell } from "@/components/common/EntityFormShell";
import FileDropzone from "@/components/common/FileDropzone";
import { CATEGORIE_MATERIALE } from "@progetto/shared/validation/materiale.schema";

type MaterialeFormData = { titolo: string; categoria: string; descrizione: string };
const INITIAL_FORM: MaterialeFormData = { titolo: "", categoria: "", descrizione: "" };

interface MaterialeModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MaterialeModal({ open, onClose, onSuccess }: MaterialeModalProps) {
    return (
        <EntityDialog open={open} onClose={onClose} size="md">
            <MaterialeForm onClose={onClose} onSuccess={onSuccess} />
        </EntityDialog>
    );
}

function MaterialeForm({ onClose, onSuccess }: Omit<MaterialeModalProps, "open">) {
    const [formData, setFormData] = useState<MaterialeFormData>(INITIAL_FORM);
    const [files, setFiles] = useState<File[]>([]);
    const { submitting, create } = useCreateEntity<FormData, unknown>("/materiali", "Materiale caricato");

    const handleSubmit = async () => {
        const data = new FormData();
        data.append("titolo", formData.titolo.trim());
        data.append("descrizione", formData.descrizione.trim());
        data.append("categoria", formData.categoria);
        data.append("file", files[0]);

        const ok = await create(data);
        if (ok) onSuccess();
    };

    return (
        <EntityFormShell
            title="Nuovo Materiale Formativo"
            submitLabel="Carica Materiale"
            submitting={submitting}
            canSubmit={files.length > 0 && !!formData.titolo.trim() && !!formData.categoria}
            onSubmit={handleSubmit}
            onClose={onClose}
        >
            <TextField
                select required fullWidth label="Tipo di materiale"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                helperText="Seleziona il tipo di materiale caricato"
            >
                {CATEGORIE_MATERIALE.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
            </TextField>
            <TextField
                required fullWidth label="Titolo del materiale"
                placeholder="Esempio: Slide della prima lezione"
                value={formData.titolo}
                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
            />
            <TextField
                fullWidth label="Descrizione"
                value={formData.descrizione}
                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
            />
            <FileDropzone files={files} onChange={setFiles} maxSizeMb={50} disabled={submitting} />
        </EntityFormShell>
    );
}