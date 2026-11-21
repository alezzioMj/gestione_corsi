"use client";

import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    MenuItem,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { API_BASE_URL } from "@/lib/config";
import { Modulo } from "@progetto/shared/validation/modulo.schema";
import { getErrorMessage } from "@/utils/errorMessages";
import { useSnackbar } from "../SnackbarContext";

interface EditModuloModalProps {
    open: boolean;
    onClose: () => void;
    modulo: Modulo;
    onSaveSuccess: () => void;
}

const COMPETENZE_ENUM = ["Teorica", "Trasversale", "Pratica"];

export default function EditModuloModal({ open, onClose, modulo, onSaveSuccess }: EditModuloModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(() => {
        if (!modulo) {
            return { titolo: "", descrizione: "", competenza: "", multiplo: false };
        }

        const isMultiplo = typeof modulo.multiplo === "string"
            ? modulo.multiplo === "true"
            : Boolean(modulo.multiplo);

        return {
            titolo: modulo.titolo || "",
            descrizione: modulo.descrizione || "",
            competenza: modulo.competenza || "",
            multiplo: isMultiplo,
        };
    });

    const { showMessage } = useSnackbar();
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (!modulo?.id) {
            showMessage("ID Modulo non valido", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/moduli/${modulo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    n_ore: 4 // Passa la chiave corretta attesa dal backend
                }),
            });

            if (res.ok) {
                onSaveSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                throw Error(errorData.message)
            }
        } catch (error: unknown) {
            console.error(error);
            showMessage(getErrorMessage(error), "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Modifica Modulo</DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="Titolo Modulo" fullWidth required
                                value={formData.titolo}
                                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                            />

                            <TextField
                                select
                                label="Livello Competenza"
                                fullWidth
                                required
                                value={formData.competenza}
                                onChange={(e) => setFormData({ ...formData, competenza: e.target.value })}
                            >
                                {COMPETENZE_ENUM.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
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

                            <TextField
                                label="Descrizione"
                                fullWidth
                                multiline
                                rows={4}
                                value={formData.descrizione || ""}
                                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Annulla</Button>
                        <Button type="submit" variant="contained" startIcon={<EditIcon />} disabled={loading}>
                            {loading ? "Salvataggio..." : "Salva Modifiche"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}