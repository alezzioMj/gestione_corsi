"use client";

import { Box, Typography, Button, Container, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlined";
import useSWR from "swr";

import type { Commessa } from "@progetto/shared/validation/commessa.schema";
import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { useEntityDialog } from "@/hooks/useEntityDialog";
import AsyncContent from "@/components/AsyncContent";
import EmptyState from "@/components/EmptyState";
import CommesseModal from "@/components/Commesse/CommessaModal";
import CommessaCard from "@/components/Commesse/CommessaCard";

const STATI = [
    { value: "APERTA", label: "Commesse aperte" },
    { value: "IN_CORSO", label: "Commesse in corso" },
    { value: "CHIUSA", label: "Commesse chiuse" },
    { value: "ANNULLATA", label: "Commesse annullate" },
] as const;

export default function CommessePage() {
    const { data, error, mutate } = useSWR<Commessa[]>("/commesse", fetcher);
    const { remove } = useDeleteEntity("/commesse");
    const { confirm } = useConfirm();
    const dialog = useEntityDialog<Commessa>();

    const handleDelete = async (c: Commessa) => {
        const confirmed = await confirm({
            title: "Eliminare commessa?",
            message: `Sei sicuro di voler eliminare la commessa "${c.codice_commessa}"?`,
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });
        if (!confirmed) return;

        const deleted = await remove(c.id);
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
                    <Typography variant="h4">Commesse</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={dialog.openCreate}>
                        Crea Nuova Commessa
                    </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione delle commesse e dei relativi clienti.
                </Typography>
            </Box>

            <AsyncContent
                data={data}
                error={error}
                onRetry={() => mutate()}
                empty={
                    <EmptyState
                        icon={WorkOutlineIcon}
                        title="Nessuna commessa trovata"
                        description="Inizia creando una nuova commessa."
                    />
                }
            >
                {(commesse) => (
                    <Stack spacing={4}>
                        {STATI.map((stato) => {
                            const filtrate = commesse.filter((c) => c.stato === stato.value);
                            if (filtrate.length === 0) return null;

                            return (
                                <Box key={stato.value}>
                                    <Typography variant="h5" sx={{ mb: 2 }}>
                                        {stato.label}
                                    </Typography>
                                    <Stack spacing={2}>
                                        {filtrate.map((c) => (
                                            <CommessaCard
                                                key={c.id}
                                                commessa={c}
                                                onEdit={() => dialog.openEdit(c)}
                                                onDelete={() => handleDelete(c)}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </AsyncContent>

            <CommesseModal
                key={dialog.entity?.id ?? "new"}
                open={dialog.open}
                commessa={dialog.entity ?? undefined}
                onClose={dialog.close}
                onSuccess={handleSuccess}
            />
        </Container>
    );
}