"use client";

import SedeCard from "@/components/Sedi/SedeCard";
import { Box, Typography, Container, CircularProgress, Alert, Button, IconButton, Paper } from "@mui/material";
import { Sede } from "../../validation/types";
import AddSedeModal from "@/components/Sedi/AddSedeModal";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { API_BASE_URL } from "@/lib/config";

export default function SediPage() {
    const [sedi, setSedi] = useState<Sede[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSedi = async () => {
            setLoading(true);
            setFetchError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/sedi`, { cache: "no-store" });
                if (!res.ok) {
                    if (res.status === 404) {
                        console.warn("Nessuna sede trovata.");
                        setSedi([]);
                    } else {
                        throw new Error(`Errore ${res.status}: ${res.statusText}`);
                    }
                } else {
                    const data = await res.json();
                    setSedi(data);
                }
            } catch (err) {
                if (err instanceof Error) {
                    console.error("Errore nel recupero delle sedi:", err);
                    setFetchError(`Impossibile caricare le sedi: ${err.message || 'Errore di rete'}. Assicurati che il backend sia attivo.`);
                } else {
                    console.error("Errore sconosciuto nel recupero delle sedi:", err);
                    setFetchError("Errore sconosciuto nel recupero delle sedi.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchSedi();
    }, []);

    const handleDeleteSede = async (sedeId: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questa sede? Verranno eliminate anche tutte le aule associate.")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/sedi/${sedeId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione della sede: ${res.statusText}`);
            }
            setSedi(prevSedi => prevSedi.filter(s => s.id !== sedeId));
            alert("Sede eliminata con successo!");
        } catch (error) {
            if (!(error instanceof Error)) {
                console.error("Errore sconosciuto nell'eliminazione della sede:", error);
                return;
            }
            setFetchError(error.message);
            alert(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione della sede:", error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>Sedi</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Visualizza e gestisci tutte le sedi create.
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <AddSedeModal />
                </Box>
            </Box>

            {fetchError && (
                <Alert
                    severity="error"
                    sx={{ mb: 4 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                            Riprova
                        </Button>
                    }
                >
                    {fetchError}
                </Alert>
            )}

            {loading ? (
                <CircularProgress />
            ) : sedi.length === 0 ? (
                <Typography variant="h6" color="text.secondary">Nessuna sede trovata. Inizia creando una nuova sede!</Typography>
            ) : (
                <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 3 }}>
                    {sedi.map((s: Sede) => (
                        <Paper key={s.id} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <SedeCard onDeleteSede={() => handleDeleteSede(s.id)} onSedeUpdated={() => window.location.reload()} sede={s} />
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>

                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
    );
}