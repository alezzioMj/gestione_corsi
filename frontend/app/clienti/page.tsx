'use client'

import { Box, Button, Container, Typography, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClientiModal from "@/components/Clienti/ClienteModal";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { fetcher } from "@/lib/swr-config";
import useSWR from "swr";
import ClienteCard from "@/components/Clienti/ClienteCard";
import { ClienteWithRelations } from "@progetto/shared/validation/types";

export default function ClientiPage() {
    const [open, setOpen] = useState(false);
    const [clienteSelezionato, setClienteSelezionato] =
        useState<ClienteWithRelations | undefined>(undefined);

    const { data, isLoading, error, mutate } = useSWR<ClienteWithRelations[]>(
        `${API_BASE_URL}/clienti`,
        fetcher
    );

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>

            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2
                    }}
                >
                    <Typography variant="h4">
                        Clienti
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setClienteSelezionato(undefined);
                            setOpen(true);
                        }}
                    >
                        Aggiungi cliente
                    </Button>
                </Box>

                <Typography>
                    Gestione dei clienti
                </Typography>
            </Box>

            {/* Modal */}
            <ClientiModal
                key={clienteSelezionato?.id ?? "nuovo"}
                open={open}
                onClose={() => setOpen(false)}
                onSuccess={() => {
                    setOpen(false);
                    setClienteSelezionato(undefined);
                    mutate();
                }}
                cliente={clienteSelezionato}
            />

            {/* Loading */}
            {isLoading && (
                <Typography color="text.secondary">
                    Caricamento clienti...
                </Typography>
            )}

            {/* Error */}
            {error && (
                <Typography color="error">
                    Errore durante il caricamento dei clienti.
                </Typography>
            )}

            {/* Clienti */}
            {data && (
                <Grid container spacing={2}>
                    {data.map((cliente) => (
                        <Grid
                            key={cliente.id}
                            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                        >
                            <ClienteCard
                                cliente={cliente}
                                onEdit={() => {
                                    setClienteSelezionato(cliente);
                                    setOpen(true);
                                }}
                                onDelete={() => {
                                    // Lo implementiamo successivamente
                                }}
                                onClick={() => {
                                    // Eventuale pagina di dettaglio
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Nessun cliente */}
            {data?.length === 0 && !isLoading && (
                <Typography color="text.secondary">
                    Nessun cliente presente.
                </Typography>
            )}

        </Container>
    );
}