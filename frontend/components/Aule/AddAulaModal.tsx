"use client";

import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { API_ENDPOINTS } from "@/lib/api";

interface AddAulaModalProps {
    sedeId: number;
    onAulaAdded : () => void
}

export default function AddAulaModal({ sedeId, onAulaAdded }: AddAulaModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nome: "",
        capienza: "",
        descrizione: ""
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({ nome: "", capienza: "", descrizione: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(API_ENDPOINTS.aule, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: formData.nome,
                    capienza: Number(formData.capienza),
                    descrizione: formData.descrizione,
                    sede_id: sedeId
                }),
            });

            if (res.ok) {
                handleClose();
                onAulaAdded();
            } else {
                alert("Errore durante la creazione dell'aula");
            }
        } catch (error) {
            console.error("Errore:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                Aggiungi Aula
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Nuova Aula</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="Nome Aula"
                                fullWidth
                                required
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            />
                            <TextField
                                label="Capienza"
                                type="number"
                                fullWidth
                                value={formData.capienza}
                                onChange={(e) => setFormData({ ...formData, capienza: e.target.value })}
                            />
                            <TextField
                                label="Descrizione"
                                fullWidth
                                value={formData.descrizione}
                                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Annulla</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? "Salvataggio..." : "Salva"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}