'use client'

import { Box, Button, Container, Typography, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClientiModal from "@/components/Clienti/ClienteModal";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { fetcher } from "@/lib/swr-config";
import useSWR from "swr";
import ClienteCard from "@/components/Clienti/ClienteCard";
import { ClienteWithRelations } from "@progetto/shared/validation/cliente.schema";
import ClienteDrawer from "@/components/Clienti/ClienteDrawer";
import { useSnackbar } from "@/components/SnackbarContext";
import { useConfirm } from "@/components/ConfirmContext";

export default function ClientiPage() {
    const [open, setOpen] = useState(false);
    const [clienteSelezionato, setClienteSelezionato] =
        useState<ClienteWithRelations | undefined>(undefined);
    const { data, isLoading, error, mutate } = useSWR<ClienteWithRelations[]>(
        `${API_BASE_URL}/clienti`,
        fetcher
    );
    const [clienteDettaglio, setClienteDettaglio] =
        useState<ClienteWithRelations | undefined>();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { showMessage } = useSnackbar();
    const { confirm } = useConfirm();

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
                                onDelete={async () => {
                                    const confirmed = await confirm({
                                        title: "Elimina cliente",
                                        message: `Sei sicuro di voler eliminare ${cliente.ragione_sociale}?`,
                                        confirmText: "Elimina",
                                        cancelText: "Annulla",
                                        confirmColor: "error"
                                    });

                                    if (!confirmed) return;

                                    try {
                                        const response = await fetch(
                                            `${API_BASE_URL}/clienti/${cliente.id}`,
                                            { method: "DELETE" }
                                        );

                                        const result = await response.json();

                                        if (!response.ok) {
                                            showMessage(
                                                result.message || "Errore durante l'eliminazione del cliente.",
                                                "error"
                                            );
                                            return;
                                        }

                                        showMessage("Cliente eliminato correttamente.", "success");
                                        mutate();

                                    } catch {
                                        showMessage("Errore di connessione al server.", "error");
                                    }
                                }}
                                onClick={() => {
                                    setClienteDettaglio(cliente);
                                    setDrawerOpen(true);
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
            <ClienteDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                cliente={clienteDettaglio}
            />
        </Container>
    );
}