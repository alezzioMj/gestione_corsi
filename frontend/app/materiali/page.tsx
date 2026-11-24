"use client";

import { Container, Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FolderOffOutlined } from "@mui/icons-material";
import useSWR from "swr";

import type { MaterialeWithUrl } from "@progetto/shared/validation/materiale.schema";
import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { useEntityDialog } from "@/hooks/useEntityDialog";
import AsyncContent from "@/components/AsyncContent";
import EmptyState from "@/components/EmptyState";
import MaterialeCard from "@/components/Materiali/MaterialeCard";
import MaterialeModal from "@/components/Materiali/MaterialeModal";

export default function MaterialiPage() {
    const { data: materiali, error, mutate } = useSWR<MaterialeWithUrl[]>("/materiali", fetcher);
    const { remove } = useDeleteEntity("/materiali");
    const { confirm } = useConfirm();
    const dialog = useEntityDialog<null>(); // solo creazione: serve solo open/close

    const handleDelete = async (materialeId: number) => {
        const confirmed = await confirm({
            title: "Elimina materiale",
            message: "Sei sicuro di voler eliminare questo materiale?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });
        if (!confirmed) return;

        const deleted = await remove(materialeId);
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
                    <Typography variant="h4">Materiali</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={dialog.openCreate}>
                        Aggiungi materiale
                    </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione e caricamento del materiale formativo.
                </Typography>
            </Box>

            <AsyncContent
                data={materiali}
                error={error}
                onRetry={() => mutate()}
                empty={
                    <EmptyState
                        icon={FolderOffOutlined}
                        title="Nessun materiale trovato"
                        description="Inizia aggiungendo materiale"
                    />
                }
            >
                {(list) => (
                    <Box
                        sx={{
                            display: "grid",
                            gap: 2,
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                            },
                        }}
                    >
                        {list.map((m) => (
                            <MaterialeCard key={m.id} materiale={m} onDelete={handleDelete} />
                        ))}
                    </Box>
                )}
            </AsyncContent>

            <MaterialeModal open={dialog.open} onClose={dialog.close} onSuccess={handleSuccess} />
        </Container>
    );
}