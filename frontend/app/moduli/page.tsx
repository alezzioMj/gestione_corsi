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
import DelayedLoading from "@/components/DelayedLoading";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import AddModuloModal from "@/components/Moduli/AddModuloModal";
import { useSnackbar } from "@/components/SnackbarContext";
import { useConfirm } from "@/components/ConfirmContext";
import EmptyState from "@/components/EmptyState";
import { ExtensionOffOutlined } from "@mui/icons-material";
import { Modulo } from "@shared/validation/types";
import { API_ENDPOINTS } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";

export default function ModuliPage() {
    const { showMessage } = useSnackbar();
    const { confirm } = useConfirm();
    const { data: moduli, error, isLoading, mutate } = useSWR(API_ENDPOINTS.moduli, fetcher);

    const handleDeleteModulo = async (moduloId: number) => {
        const ok = await confirm({
            title: "Elimina modulo",
            message: "Sei sicuro di voler eliminare questo modulo?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        }
        )
        if (!ok) return;
        try {
            const res = await fetch(`${API_BASE_URL}/moduli/${moduloId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione del modulo: ${res.statusText}`);
            }
            mutate();
            showMessage("Modulo eliminato con successo!");
        } catch (error: unknown) {
            showMessage(`Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
            console.error("Errore nell'eliminazione del modulo:", error);
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
                    <Typography variant="h4">Moduli</Typography>
                    <AddModuloModal onModuloAdded={() => mutate()} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {" Gestione dei moduli didattici e dei relativi materiali "}
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
            ) : !moduli || moduli.length === 0 ? (
                <EmptyState
                    icon={ExtensionOffOutlined}
                    title={"Nessun modulo trovato"}
                    description={"Inizia aggiungendo un nuovo modulo"}
                />

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