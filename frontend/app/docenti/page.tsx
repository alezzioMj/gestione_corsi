"use client";

import DocenteCard from "@/components/Docenti/DocenteCard";
import { Box, Typography, Container, CircularProgress, Alert, Button, Paper } from "@mui/material";
import { Docente } from "../../validation/types";
import AddDocenteModal from "@/components/Docenti/AddDocenteModal";
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";

export default function DocentiPage() {
    const [docenti, setDocenti] = useState<Docente[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchDocenti = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/docenti`, { cache: "no-store" });
            if (!res.ok) {
                if (res.status === 404) {
                    console.warn("Nessun docente trovato.");
                    setDocenti([]);
                } else {
                    throw new Error(`Errore ${res.status}: ${res.statusText}`);
                }
            } else {
                const data = await res.json();
                setDocenti(data);
            }
        } catch (err: unknown) {
            console.error("Errore nel recupero dei docenti:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setFetchError(`Impossibile caricare i docenti: ${errorMessage}. Assicurati che il backend sia attivo.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocenti();
    }, []);

    const handleDeleteDocente = async (codice_fiscale: string) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo docente?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/docenti/${codice_fiscale}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione del docente: ${res.statusText}`);
            }
            setDocenti(prevDocenti => prevDocenti.filter(d => d.codice_fiscale !== codice_fiscale));
            alert("Docente eliminato con successo!");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            alert(`Errore: ${errorMessage}`);
            console.error("Errore nell'eliminazione del docente:", err);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Docenti</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione dell'anagrafica docenti e dei relativi contatti.
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <AddDocenteModal />
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
            ) : docenti.length === 0 ? (
                <Typography variant="h6" color="text.secondary">Nessun docente trovato. Inizia aggiungendo un nuovo docente!</Typography>
            ) : (
                <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 3 }}>
                    {docenti.map((d: Docente) => (
                        <Paper key={d.codice_fiscale} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <DocenteCard
                                docente={d}
                                onDocenteUpdated={fetchDocenti} // Passa la funzione di refresh
                                onDeleteDocente={handleDeleteDocente} // Passa la funzione di eliminazione
                            />
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
    );
}