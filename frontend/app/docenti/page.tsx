"use client";

import DocenteCard from "@/components/Docenti/DocenteCard";
import { Box, Typography, Container, Alert, Button, Paper } from "@mui/material";
import { Docente } from "../../validation/types";
import AddDocenteModal from "@/components/Docenti/AddDocenteModal";
import { API_BASE_URL } from "@/lib/config";
import DelayedLoading from "@/components/DelayedLoading";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";

export default function DocentiPage() {
    const { data: docenti, error, isLoading, mutate } = useSWR(`${API_BASE_URL}/docenti`, fetcher);

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
            mutate();
            alert("Docente eliminato con successo!");
        } catch (error : unknown) {
            if(!(error instanceof Error)){
                console.error("Errore sconosciuto nell'eliminazione del docente:", error);
                return;
            }
            alert(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione del docente:", error);
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
                <Typography variant="h4" gutterBottom>Docenti</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {" Gestione dell'anagrafica docenti e dei relativi contatti. "}
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <AddDocenteModal />
                </Box>
            </Box>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 4 }}
                    action={
                        <Button color="inherit" size="small" onClick={mutate}>
                            Riprova
                        </Button>
                    }
                >
                    {error.message}
                </Alert>
            )}

            {isLoading ? (
                <DelayedLoading />
            ) : !docenti || docenti.length === 0 ? (
                <Typography variant="h6" color="text.secondary">
                    Nessun docente trovato. Inizia aggiungendo un nuovo docente!
                </Typography>
            ) : (
                <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: 3 }}>
                    {docenti.map((d: Docente) => (
                        <Paper key={d.codice_fiscale} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <DocenteCard
                                docente={d}
                                onDocenteUpdated={() => mutate()} // Passa la funzione di refresh
                                onDeleteDocente={handleDeleteDocente} // Passa la funzione di eliminazione
                            />
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
    );
}