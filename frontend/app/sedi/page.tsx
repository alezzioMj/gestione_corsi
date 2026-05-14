"use client";
import SedeCard from "@/components/Sedi/SedeCard";
import { Box, Typography, Container, Alert, Button, Paper } from "@mui/material";
import { Sede } from "../../validation/types";
import AddSedeModal from "@/components/Sedi/AddSedeModal"
import { API_BASE_URL } from "@/lib/config";
import DelayedLoading from "@/components/DelayedLoading";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";

export default function SediPage() {
    const { data: sedi, error, isLoading, mutate } = useSWR(`${API_BASE_URL}/sedi`, fetcher);

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
            mutate();
            alert("Sede eliminata con successo!");
        } catch (error) {
            if (!(error instanceof Error)) {
                console.error("Errore sconosciuto nell'eliminazione della sede:", error);
                return;
            }
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
                    <AddSedeModal onSedeAdded={() => mutate}/>
                </Box>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 4 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => mutate}>
                            Riprova
                        </Button>
                    }
                >
                    {error.message}
                </Alert>
            )}

            {isLoading ? (
                <DelayedLoading />
            ) : sedi.length === 0 ? (
                <Typography variant="h6" color="text.secondary">Nessuna sede trovata. Inizia creando una nuova sede!</Typography>
            ) : (
                <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 3 }}>
                    {sedi.map((s: Sede) => (
                        <Paper key={s.id} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <SedeCard onDeleteSede={() => handleDeleteSede(s.id)} onSedeUpdated={() => mutate} sede={s} />
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>

                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
    );
}