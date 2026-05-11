"use client";

import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { API_BASE_URL } from "@/lib/config";

interface EditModuloModalProps {
    open: boolean;
    onClose: () => void;
    modulo: any; 
    onSaveSuccess: () => void;
}

export default function EditModuloModal({ open, onClose, modulo, onSaveSuccess }: EditModuloModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: "",
        descrizione: "",
        ore: 0
    });

    useEffect(() => {
        if (modulo) {
            setFormData({
                nome: modulo.nome || "",
                descrizione: modulo.descrizione || "",
                ore: modulo.ore || 0
            });
        }
    }, [modulo, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/moduli/${modulo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSaveSuccess();
                onClose();
            } else {
                alert("Errore durante l'aggiornamento del modulo");
            }
        } catch (err) {
            alert("Errore di rete");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <form onSubmit={handleSubmit}>
                <DialogTitle>Modifica Modulo</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField 
                            label="Nome Modulo" fullWidth required 
                            value={formData.nome} 
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
                        />
                        <TextField 
                            label="Ore" type="number" fullWidth required 
                            value={formData.ore} 
                            onChange={(e) => setFormData({ ...formData, ore: Number(e.target.value) })} 
                        />
                        <TextField label="Descrizione" fullWidth multiline rows={4} value={formData.descrizione} onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })} />
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
    );
}