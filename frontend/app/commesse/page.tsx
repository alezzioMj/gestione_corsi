
"use client";

import { Box, Typography, Button, Alert, Container, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlined";
import EmptyState from "@/components/EmptyState";
import DelayedLoading from "@/components/DelayedLoading";
import { API_BASE_URL } from "@/lib/config";
import { fetcher } from "@/lib/swr-config";
import useSWR from 'swr';
import CommesseModal from "@/components/Commesse/CommessaModal";
import { CommessaSchema } from "@progetto/shared/validation/types";
import { useState } from "react";
import CommessaCard from "@/components/Commesse/CommessaCard";
import { useSnackbar } from "@/components/SnackbarContext";
import { useConfirm } from "@/components/ConfirmContext";

const STATI = [
    { value: "APERTA", label: "Commesse aperte" },
    { value: "IN_CORSO", label: "Commesse in corso" },
    { value: "CHIUSA", label: "Commesse chiuse" },
    { value: "ANNULLATA", label: "Commesse annullate" },
] as const;

export default function CommessePage() {
    const [open, setOpen] = useState(false);
    const [commessaSelezionata, setcommessaSelezionata] =
        useState<CommessaSchema | undefined>(undefined);
    const { data, isLoading, error, mutate } = useSWR(`${API_BASE_URL}/commesse`, fetcher);
    const { showMessage } = useSnackbar();
    const { confirm } = useConfirm();

    const handleDelete = async (c: CommessaSchema) => {
        const confirmed = await confirm({
            title: "Eliminare commessa?",
            message: `Sei sicuro di voler eliminare la commessa "${c.codice_commessa}"?`,
            confirmText: "Elimina",
            cancelText: "Annulla",
            confirmColor: "error"
        });

        if (!confirmed) return;

        try {
            const res = await fetch(`${API_BASE_URL}/commesse/${c.id}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);

                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Errore durante l'eliminazione della commessa"
                );
            }

            await mutate();

            showMessage("Commessa eliminata con successo");
        } catch (error) {
            console.error(error);

            showMessage(
                error instanceof Error
                    ? error.message
                    : "Errore durante l'eliminazione della commessa"
            );
        }
    };

    const handleEdit = (c: CommessaSchema) => {
        setcommessaSelezionata(c);
        setOpen(true);
    }

    const handleSubmit = () => {
        mutate();
        setcommessaSelezionata(undefined);
        setOpen(false);
    }

    const handleClose = () => {
        setcommessaSelezionata(undefined);
        setOpen(false);
    }

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>

            {/* Page header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2
                }}>
                    <Typography variant="h4">
                        Commesse
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        color="primary"
                        onClick={() => {
                            setOpen(true);
                        }
                        }
                    >
                        Crea Nuova Commessa
                    </Button>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione delle commesse e dei relativi clienti.
                </Typography>
            </Box>

            {/* Error state */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 4 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                        >
                            Riprova
                        </Button>
                    }
                >
                    Errore durante il caricamento delle commesse.
                </Alert>
            )}

            {/* Loading state */}
            {isLoading ? (
                <DelayedLoading />
            ) : data.length === 0 ? (
                <EmptyState
                    icon={WorkOutlineIcon}
                    title="Nessuna commessa trovata"
                    description="Inizia creando una nuova commessa."
                />
            ) : (
                <Stack spacing={4}>
                    {STATI.map(stato => {
                        const commesseFiltrate = data.filter(
                            c => c.stato === stato.value
                        );

                        if (commesseFiltrate.length === 0) return null;

                        return (
                            <Box key={stato.value}>
                                <Typography variant="h5" sx={{ mb: 2 }}>
                                    {stato.label}
                                </Typography>

                                <Stack spacing={2}>
                                    {commesseFiltrate.map(c => (
                                        <CommessaCard
                                            key={c.id}
                                            commessa={c}
                                            onDelete={() => handleDelete(c)}
                                            onEdit={() => handleEdit(c)}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        );
                    })}
                </Stack>
            )}
            <CommesseModal
                key={commessaSelezionata?.id}
                commessa={commessaSelezionata}
                open={open}
                onClose={() => handleClose()}
                onSuccess={() => handleSubmit()}
            >

            </CommesseModal>
        </Container>
    );
}
