"use client";

import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { API_BASE_URL } from "@/lib/config";

interface EditProgrammaModalProps {
    open: boolean;
    onClose: () => void;
    programma: any;
    onSaveSuccess: () => void;
}

export default function EditProgrammaModal({ open, onClose, programma, onSaveSuccess }: EditProgrammaModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titolo: "",
        descrizione: ""
    });

    useEffect(() => {
        if (programma) {
            setFormData({
                titolo: programma.titolo || "",
                descrizione: programma.descrizione || ""
            });
        }
    }, [programma, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/programmi/${programma.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSaveSuccess();
                onClose();
            } else {
                alert("Errore durante l'aggiornamento del programma");
            }
        } catch (err) {
            alert("Errore di rete");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <form onSubmit={handleSubmit}>
                <DialogTitle>Modifica Programma</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField 
                            label="Titolo Programma" fullWidth required 
                            value={formData.titolo} 
                            onChange={(e) => setFormData({ ...formData, titolo: e.target.value })} 
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