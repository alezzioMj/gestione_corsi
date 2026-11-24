"use client";

import { Box, Button, Container, Typography, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import useSWR from "swr";

import type { ClienteWithRelations } from "@progetto/shared/validation/cliente.schema";
import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { useEntityDialog } from "@/hooks/useEntityDialog";
import AsyncContent from "@/components/AsyncContent";
import EmptyState from "@/components/EmptyState";
import ClientiModal from "@/components/Clienti/ClienteModal";
import ClienteCard from "@/components/Clienti/ClienteCard";
import ClienteDrawer from "@/components/Clienti/ClienteDrawer";

type ClienteItem = ClienteWithRelations<"sedi">;

export default function ClientiPage() {
    const { data, error, mutate } = useSWR<ClienteItem[]>("/clienti?include=sedi", fetcher);
    const { remove } = useDeleteEntity("/clienti");
    const { confirm } = useConfirm();
    const dialog = useEntityDialog<ClienteItem>();
    const drawer = useEntityDialog<ClienteItem>();

    // Dati aggiornati dalla lista; se il cliente non c'è più, resta l'ultima copia
    const clienteDettaglio = data?.find((c) => c.id === drawer.entity?.id) ?? drawer.entity;

    const handleDelete = async (cliente: ClienteItem) => {
        const confirmed = await confirm({
            title: "Elimina cliente",
            message: `Sei sicuro di voler eliminare ${cliente.ragione_sociale}?`,
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });
        if (!confirmed) return;

        const deleted = await remove(cliente.id);
        if (deleted) mutate();
    };

    const handleSuccess = () => {
        mutate();
        dialog.close();
    };

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Typography variant="h4">Clienti</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={dialog.openCreate}>
                        Aggiungi cliente
                    </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione dei clienti
                </Typography>
            </Box>

            <AsyncContent
                data={data}
                error={error}
                onRetry={() => mutate()}
                empty={
                    <EmptyState
                        icon={PersonOffOutlinedIcon}
                        title="Nessun cliente presente"
                        description="Inizia aggiungendo un nuovo cliente"
                    />
                }
            >
                {(clienti) => (
                    <Grid container spacing={2}>
                        {clienti.map((cliente) => (
                            <Grid key={cliente.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <ClienteCard
                                    cliente={cliente}
                                    onEdit={() => dialog.openEdit(cliente)}
                                    onDelete={() => handleDelete(cliente)}
                                    onClick={() => drawer.openEdit(cliente)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </AsyncContent>

            <ClientiModal
                key={dialog.entity?.id ?? "new"}
                open={dialog.open}
                cliente={dialog.entity ?? undefined}
                onClose={dialog.close}
                onSuccess={handleSuccess}
            />

            <ClienteDrawer
                open={drawer.open}
                onClose={drawer.close}
                cliente={clienteDettaglio ?? undefined}
            />
        </Container>
    );
}