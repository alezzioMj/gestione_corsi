"use client";

import DocenteCard from "@/components/Docenti/DocenteCard";
import { Box, Typography, Container, Alert, Button, Paper } from "@mui/material";
import { Docente } from "@shared/validation/types";
import AddDocenteModal from "@/components/Docenti/AddDocenteModal";
import DelayedLoading from "@/components/DelayedLoading";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import { useSnackbar } from "@/components/SnackbarContext";
import EmptyState from "@/components/EmptyState";
import { PersonOffOutlined } from "@mui/icons-material";
import { API_ENDPOINTS } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";

export default function DocentiPage() {
    const { data: docenti, error, isLoading, mutate } = useSWR(API_ENDPOINTS.docenti, fetcher);
    const { confirm } = useConfirm();
    const { showMessage } = useSnackbar();

    const handleDeleteDocente = async (codice_fiscale: string) => {
        const ok = await confirm({
            title: "Elimina docente",
            message: "Sei sicuro di voler eliminare questo docente?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        }
        )
        if (!ok) return;
        try {
            const res = await fetch(`${API_BASE_URL}/docenti/${codice_fiscale}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione del docente: ${res.statusText}`);
            }
            mutate();
            showMessage("Docente eliminato con successo!");
        } catch (error: unknown) {
            if (!(error instanceof Error)) {
                console.error("Errore sconosciuto nell'eliminazione del docente:", error);
                return;
            }
            showMessage(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione del docente:", error);
        }
    };

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            <Box sx={{
                mb: 4
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap', // così non si rompe su schermi stretti
                    gap: 2,
                }}>
                    <Typography variant="h4">Docenti</Typography>
                    <AddDocenteModal />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {" Gestione dell'anagrafica docenti e dei relativi contatti. "}
                </Typography>
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
            ) : !docenti || docenti.length === 0 ? (
                <EmptyState
                    icon={PersonOffOutlined}
                    title={"Nessun docente trovato"}
                    description={"Inizia aggiungendo un nuovo docente"}
                />
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