"use client";
import SedeCard from "@/components/Sedi/SedeCard";
import { Box, Typography, Container, Alert, Button, Paper } from "@mui/material";
import { Sede } from "@progetto/shared/validation/types";
import AddSedeModal from "@/components/Sedi/AddSedeModal";
import DelayedLoading from "@/components/DelayedLoading";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import EmptyState from "@/components/EmptyState";
import { LocationOffOutlined } from "@mui/icons-material";
import { useSnackbar } from "@/components/SnackbarContext";
import { useConfirm } from "@/components/ConfirmContext";
import { API_ENDPOINTS } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";

export default function SediPage() {
    //SWR hook for fetching /Sedi
    const { data: sedi, error, isLoading, mutate } = useSWR(API_ENDPOINTS.sedi, fetcher);
    const { showMessage } = useSnackbar();
    const { confirm } = useConfirm();

    //Handling sede deletion
    const handleDeleteSede = async (sedeId: number) => {
        const ok = await confirm({
            title: "Elimina sede",
            message: "Sei sicuro di voler eliminare questa sede?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        }
        )
        if (!ok) return;
        try {
            const res = await fetch(`${API_BASE_URL}/sedi/${sedeId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione della sede: ${res.statusText}`);
            }
            //Update SWR cache 
            mutate();
            showMessage("Sede eliminata con successo!");
        } catch (error) {
            if (!(error instanceof Error)) {
                console.error("Errore sconosciuto nell'eliminazione della sede:", error);
                return;
            }
            showMessage(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione della sede:", error);
        }
    };

    return (
        <>
            {/* SEDI page */}
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
                        <Typography variant="h4">Sedi</Typography>
                        <AddSedeModal onSedeAdded={() => mutate()} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        {" Gestione delle sedi e delle aule associate "}
                    </Typography>
                </Box>

                {/*Error allert */}
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

                {/*Loading */}
                {isLoading ? (
                    <DelayedLoading />
                ) : !sedi || sedi.length === 0 ? (
                    <>
                        {/* Handle empty array case*/}
                        <EmptyState
                            icon={LocationOffOutlined}
                            title={"Nessuna sede trovata"}
                            description={"Inizia aggiungendo una nuova sede"}
                        />
                    </>
                ) : (
                    <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: 3 }}>
                        {sedi.map((s: Sede) => (
                            <Paper key={s.id} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <SedeCard onDeleteSede={() => handleDeleteSede(s.id)} onSedeUpdated={() => mutate()} sede={s} />
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>

                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Container>
        </>
    );
}