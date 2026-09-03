"use client";

import {
    Box,
    Typography,
    Container,
    Button,
    Paper,
    Alert,
} from "@mui/material";
import ModuloCard from "@/components/Moduli/ModuloCard";
import { API_BASE_URL } from "@/lib/config";
import DelayedLoading from "@/components/DelayedLoading";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import AddModuloModal from "@/components/Moduli/AddModuloModal";

interface Modulo {
    id: number;
    titolo: string;
    ore: number;
    descrizione: string;
}

export default function ModuliPage() {
    const { data: moduli, error, isLoading, mutate } = useSWR(`${API_BASE_URL}/moduli`, fetcher);

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
            mutate();
            alert("Modulo eliminato con successo!");
        } catch (error: unknown) {
            alert(`Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
            console.error("Errore nell'eliminazione del modulo:", error);
        }
    };

    return (
        <Container sx={{ py: 2 }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                mb: 4
            }}>
                <Typography variant="h4" gutterBottom>Moduli Formativi</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione dei moduli didattici e dei relativi materiali.
                </Typography>
                <Box sx={{ mb: 4 }}>
                    <AddModuloModal onModuloAdded={() => mutate()} />
                </Box>
            </Box>
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 4 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => mutate()}>
                            Riprova
                        </Button>
                    }
                >
                    {error.message}
                </Alert>
            )}
            {isLoading ? (
                <DelayedLoading />
            ) : !moduli || moduli.length === 0 ? (
                <Typography variant="h6" color="text.secondary">Nessun modulo trovato. Inizia aggiungendo un nuovo modulo!</Typography>
            ) : (
                <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: 3 }}>
                    {moduli.map((m: Modulo) => (
                        <Paper
                            key={m.id}
                            variant="outlined"
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                width: '100%',
                                height: '100%'
                            }}
                        >    <ModuloCard
                                modulo={m}
                                onModuloUpdated={() => mutate()}
                                onDeleteModulo={handleDeleteModulo}
                            />
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
    );
}