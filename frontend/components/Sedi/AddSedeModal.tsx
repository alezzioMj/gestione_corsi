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

import { API_BASE_URL } from "@/lib/config";

export default function AddSedeModal({ onSedeAdded }: { onSedeAdded: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fields = [
        { key: 'nome', label: 'Nome Sede', required: true },
        { key: 'indirizzo', label: 'Indirizzo', required: true },
        { key: 'civico', label: 'Civico', required: false },
        { key: 'cap', label: 'CAP', required: true },
        { key: 'citta', label: 'Città', required: true },
        { key: 'provincia', label: 'Provincia', required: true },
        { key: 'descrizione', label: 'Descrizione', required: false, multiline: true, rows: 3 },
    ] as const;

    const [formData, setFormData] = useState({
        nome: "",
        indirizzo: "",
        civico: "",
        cap: "",
        citta: "",
        provincia: "",
        descrizione: ""
    });

    // Handle modal opening and closing (reset form data)
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({
            nome: "",
            indirizzo: "",
            civico: "",
            cap: "",
            citta: "",
            provincia: "",
            descrizione: ""
        });
    };

    const handleChange = (field: keyof typeof formData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => 
      setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/sedi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSedeAdded();
                handleClose();
            } else {
                const errorData = await res.json();
                alert(`Errore durante la creazione della sede: ${errorData.error || res.statusText}`);
            }
        } catch (error) {
            console.error("Errore:", error);
            alert("Si è verificato un errore di rete.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                Crea Nuova Sede
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Crea Nuova Sede</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            {fields.map((f) => ( 
                                <TextField key={f.key} label={ f.label } fullWidth required={f.required} value={formData[f.key]} onChange={ handleChange( f.key ) } />
                                )
                            )}
                            </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Annulla</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? "Creazione..." : "Crea"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}