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
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

export default function AddSedeModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        nome: "",
        indirizzo: "",
        civico: "",
        cap: "",
        citta: "",
        provincia: "",
        descrizione: ""
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/sedi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                handleClose();
                router.refresh(); // Ricarica i dati della pagina (Server Component)
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

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Crea Nuova Sede</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField label="Nome Sede" fullWidth required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                            <TextField label="Indirizzo" fullWidth required value={formData.indirizzo} onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })} />
                            <TextField label="Civico" fullWidth value={formData.civico} onChange={(e) => setFormData({ ...formData, civico: e.target.value })} />
                            <TextField label="CAP" fullWidth required value={formData.cap} onChange={(e) => setFormData({ ...formData, cap: e.target.value })} />
                            <TextField label="Città" fullWidth required value={formData.citta} onChange={(e) => setFormData({ ...formData, citta: e.target.value })} />
                            <TextField label="Provincia" fullWidth required value={formData.provincia} onChange={(e) => setFormData({ ...formData, provincia: e.target.value })} />
                            <TextField label="Descrizione" fullWidth multiline rows={3} value={formData.descrizione} onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })} />
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