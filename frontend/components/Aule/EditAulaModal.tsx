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
import { Aula } from "@shared/validation/types";
import { API_ENDPOINTS } from "@/lib/api";

interface EditAulaModalProps {
    open: boolean,
    onClose: () => void,
    onSaveSuccess: () => void,
    aula: Aula
}

export default function EditAulaModal({ open, onClose, onSaveSuccess, aula }: EditAulaModalProps) {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nome: aula.nome,
        capienza: aula.capienza,
        descrizione: aula.descrizione
    });

    const handleClose = () => {
        onClose();
        setFormData({ nome: aula.nome, capienza: aula.capienza, descrizione: aula.descrizione });
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_ENDPOINTS.aule}${aula.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: formData.nome,
                    capienza: Number(formData.capienza),
                    sede_id: aula.sede_id,
                    descrizione: formData.descrizione ?? ""
                }),
            });

            if (res.ok) {
                onSaveSuccess();
                onClose(); // Ricarica i dati della pagina (Server Component)
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
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Modifica Aula</DialogTitle>
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
                                onChange={(e) => setFormData({ ...formData, capienza: e.target.value === "" ? 0 : Number(e.target.value) })}
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