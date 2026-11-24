"use client";

import { Box, Typography, Container, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { LocationOffOutlined } from "@mui/icons-material";
import useSWR from "swr";

import type { Sede } from "@progetto/shared/validation/sede.schema";
import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { useEntityDialog } from "@/hooks/useEntityDialog";
import AsyncContent from "@/components/AsyncContent";
import EmptyState from "@/components/EmptyState";
import SedeCard from "@/components/Sedi/SedeCard";
import SedeModal from "@/components/Sedi/SedeModal";

export default function SediPage() {
    const { data: sedi, error, mutate } = useSWR<Sede[]>("/sedi", fetcher);
    const { remove } = useDeleteEntity("/sedi");
    const { confirm } = useConfirm();
    const dialog = useEntityDialog<Sede>();

    const handleDeleteSede = async (sedeId: number) => {
        const confirmed = await confirm({
            title: "Elimina sede",
            message: "Sei sicuro di voler eliminare questa sede?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });
        if (!confirmed) return;

        const deleted = await remove(sedeId);
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
                        flexWrap: "wrap", // così non si rompe su schermi stretti
                        gap: 2,
                    }}
                >
                    <Typography variant="h4">Sedi</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={dialog.openCreate}>
                        Crea Nuova Sede
                    </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione delle sedi e delle aule associate
                </Typography>
            </Box>

            <AsyncContent
                data={sedi}
                error={error}
                onRetry={() => mutate()}
                empty={
                    <EmptyState
                        icon={LocationOffOutlined}
                        title="Nessuna sede trovata"
                        description="Inizia aggiungendo una nuova sede"
                    />
                }
            >
                {(list) => (
                    <Box
                        sx={{
                            width: "100%",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))",
                            gap: 3,
                        }}
                    >
                        {list.map((s) => (
                            <SedeCard
                                key={s.id}
                                sede={s}
                                onEdit={dialog.openEdit}
                                onDelete={handleDeleteSede}
                            />
                        ))}
                    </Box>
                )}
            </AsyncContent>

            <SedeModal
                open={dialog.open}
                sede={dialog.entity}
                onClose={dialog.close}
                onSuccess={handleSuccess}
            />
        </Container>
    );
}