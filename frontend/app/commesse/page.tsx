
"use client";

import { Box, Typography, Button, Alert, Container } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlined";
import EmptyState from "@/components/EmptyState";
import DelayedLoading from "@/components/DelayedLoading";
import { API_BASE_URL } from "@/lib/config";
import { fetcher } from "@/lib/swr-config";
import useSWR from 'swr';
import CommesseModal from "@/components/Commesse/CommesseModal";
import { CommessaSchema } from "@progetto/shared/validation/types";
import { useState } from "react";

export default function CommessePage() {
    const [open, setOpen] = useState(false);
    const [commessaSelezionata, setcommessaSelezionata] =
        useState<CommessaSchema | undefined>(undefined);

    // TODO: Connect SWR to the commesse endpoint

    const { data, isLoading, error, mutate } = useSWR(`${API_BASE_URL}/commesse`, fetcher);

    const handleRetry = () => {
        // TODO: Retry loading commesse
    };

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
                            onClick={handleRetry}
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

                /* Empty state */
                <EmptyState
                    icon={WorkOutlineIcon}
                    title="Nessuna commessa trovata"
                    description="Inizia creando una nuova commessa."
                />

            ) : (

                /* Commesse list */
                <Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Commesse esistenti
                    </Typography>

                    {/* TODO: Render commesse */}
                </Box>
            )}
            <CommesseModal open={open} onClose={() => 1} onSuccess={() => 1}></CommesseModal>
        </Container>
    );
}
