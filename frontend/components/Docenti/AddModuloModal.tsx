"use client";

import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Box,
    TextField,
    InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import { Docente } from "../../validation/types";
import { API_BASE_URL } from "@/lib/config";

interface Modulo {
    id: number;
    titolo: string;
}

interface ModuloDocente {
    modulo_id: number;
    docente_cf: string;
}

interface AddModuloModalProps {
    docente: Docente;
}

export default function AddModuloModal({ docente }: AddModuloModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [moduli, setModuli] = useState<Modulo[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setSearchQuery("");
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Carica tutti i moduli totali disponibili nel sistema
            const resModuli = await fetch(`${API_BASE_URL}/moduli`);
            const allModuli: Modulo[] = await resModuli.json();
            setModuli(allModuli);

            // 2. Carica i moduli attualmente associati a questo docente
            const resAssociazioni = await fetch(`${API_BASE_URL}/docenti/${docente.codice_fiscale}/moduli`, { cache: 'no-store' });

            if (resAssociazioni.status === 404) {
                setSelectedIds([]); // Il docente non ha moduli, puliamo lo stato
            } else if (resAssociazioni.ok) {
                const dataAssociazioni = await resAssociazioni.json();

                // Estrae gli ID in modo flessibile
                const currentIds = Array.isArray(dataAssociazioni)
                    ? dataAssociazioni.map((m: ModuloDocente) => m.modulo_id || "")
                    : (dataAssociazioni.docente_modulo?.map((m: ModuloDocente) => m.modulo_id) || []);

                setSelectedIds(currentIds);
            }
        } catch (error) {
            console.error("Errore nel caricamento dei moduli:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    const handleToggle = (id: number) => () => {
        const currentIndex = selectedIds.indexOf(id);
        const newChecked = [...selectedIds];

        if (currentIndex === -1) {
            newChecked.push(id);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedIds(newChecked);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/docenti/${docente.codice_fiscale}/moduli_bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ moduli_ids: selectedIds }),
            });

            if (res.ok) {
                router.refresh();
                handleClose();
            } else {
                alert("Errore durante il salvataggio delle competenze");
            }
        } catch (error) {
            console.error("Errore:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredModuli = moduli.filter((modulo) =>
        modulo.titolo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Button variant="contained" onClick={handleOpen}>
                Associa Moduli
            </Button>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>Associa Moduli a {docente.nome} {docente.cognome}</DialogTitle>
                <DialogContent dividers>
                    {loading && moduli.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: 2, mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Cerca modulo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                                <Box sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                                    {selectedIds.length} selezionati
                                </Box>
                            </Box>
                            <Grid container spacing={1}>
                                {filteredModuli.map((modulo) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={modulo.id}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedIds.indexOf(modulo.id) !== -1}
                                                    onChange={handleToggle(modulo.id)}
                                                />
                                            }
                                            label={modulo.titolo}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>Annulla</Button>
                    <Button onClick={handleSave} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Salva Competenze"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}