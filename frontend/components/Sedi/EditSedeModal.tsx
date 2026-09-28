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
import { Sede } from "@progetto/shared/validation/types";

interface EditSedeModalProps {
    open: boolean;
    onClose: () => void;
    sede: Sede; // Sostituisci con il tipo Sede appropriato
    onSaveSuccess: () => void;
}

export default function EditSedeModal({ open, onClose, sede, onSaveSuccess }: EditSedeModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: sede.nome || "",
        indirizzo: sede.indirizzo || "",
        civico: sede.civico || "",
        cap: sede.cap || "",
        citta: sede.citta || "",
        provincia: sede.provincia || "",
        descrizione: sede.descrizione || ""
    });

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/sedi/${sede.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSaveSuccess();
                onClose();
            } else {
                alert("Errore durante l'aggiornamento della sede");
            }
        } catch (err) {
            console.error(err);
            alert("Errore di rete");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <form onSubmit={handleSubmit}>
                <DialogTitle>Modifica Sede</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Nome Sede" fullWidth required
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Indirizzo" sx={{ flex: 2 }} required
                                value={formData.indirizzo}
                                onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                            />
                            <TextField
                                label="Civ." sx={{ flex: 1 }}
                                value={formData.civico}
                                onChange={(e) => setFormData({ ...formData, civico: e.target.value })}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="CAP" value={formData.cap} onChange={(e) => setFormData({ ...formData, cap: e.target.value })} />
                            <TextField label="Città" fullWidth required value={formData.citta} onChange={(e) => setFormData({ ...formData, citta: e.target.value })} />
                            <TextField label="Prov." value={formData.provincia} onChange={(e) => setFormData({ ...formData, provincia: e.target.value })} />
                        </Box>
                        <TextField label="Descrizione" fullWidth multiline rows={3} value={formData.descrizione} onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })} />
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