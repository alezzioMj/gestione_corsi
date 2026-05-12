"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Typography,
    Container,
    Button,
    Paper,
    CircularProgress,
    Alert,
} from "@mui/material";
import ModuloCard from "@/components/Moduli/ModuloCard";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface Modulo {
    id: number;
    titolo: string;
    ore: number;
    descrizione: string;
}

export default function ModuliPage() {
    const [moduli, setModuli] = useState<Modulo[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const router = useRouter();

    const fetchModuli = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/moduli`, { cache: "no-store" });
            if (!res.ok) {
                if (res.status === 404) {
                    console.warn("Nessun modulo trovato.");
                    setModuli([]);
                } else {
                    throw new Error(`Errore ${res.status}: ${res.statusText}`);
                }
            } else {
                const data = await res.json();
                setModuli(data);
            }
        } catch (err: unknown) {
            console.error("Errore nel recupero dei moduli:", err);
            setFetchError(`Impossibile caricare i moduli: ${err instanceof Error ? err.message : 'Errore di rete'}. Assicurati che il backend sia attivo.`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModuli();
    }, [fetchModuli]);

    const handleDeleteModulo = async (moduloId: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo modulo?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/moduli/${moduloId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione del modulo: ${res.statusText}`);
            }
            setModuli(prevModuli => prevModuli.filter(m => m.id !== moduloId));
            alert("Modulo eliminato con successo!");
        } catch (error: unknown) {
            alert(`Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
            console.error("Errore nell'eliminazione del modulo:", error);
        } finally {
            router.refresh(); // For Next.js to re-fetch server components
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>Moduli Formativi</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione dei moduli didattici e dei relativi materiali.
                </Typography>
                <Box sx={{ mb: 4 }}>
                    {/* Assumendo che esista un AddModuloModal simile a AddDocenteModal */}
                    {/* <AddModuloModal onModuloAdded={fetchModuli} /> */}
                    <Button variant="contained" onClick={() => alert("Implementa AddModuloModal")}>Aggiungi Modulo</Button>
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
            ) : moduli.length === 0 ? (
                <Typography variant="h6" color="text.secondary">Nessun modulo trovato. Inizia aggiungendo un nuovo modulo!</Typography>
            ) : (
                <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 3 }}>
                    {moduli.map((m: Modulo) => (
                        <Paper key={m.id} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <ModuloCard
                                modulo={m}
                                onModuloUpdated={fetchModuli}
                                onDeleteModulo={handleDeleteModulo}
                            />
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
    );
}