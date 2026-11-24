"use client";

import { Box, Typography, Container, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FolderOffOutlined } from "@mui/icons-material";
import useSWR from "swr";

import type { ProgrammaWithRelations } from "@progetto/shared/validation/programma.schema";
import { fetcher } from "@/lib/swr-config";
import { API_ENDPOINTS } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmContext";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { useEntityDialog } from "@/hooks/useEntityDialog";
import AsyncContent from "@/components/AsyncContent";
import EmptyState from "@/components/EmptyState";
import ProgrammaCard from "@/components/Programmi/ProgrammaCard";
import ProgrammaModal from "@/components/Programmi/ProgrammaModal";

type ProgrammaItem = ProgrammaWithRelations<"programma_modulo" | "corso">;

export default function ProgrammiPage() {
    const { data: programmi, error, mutate } = useSWR<ProgrammaItem[]>('/programmi?include=corso,programma_modulo', fetcher);
    const { remove } = useDeleteEntity("/programmi");
    const { confirm } = useConfirm();
    const dialog = useEntityDialog<ProgrammaItem>();

    const handleDeleteProgramma = async (programmaId: number) => {
        const confirmed = await confirm({
            title: "Elimina programma",
            message: "Sei sicuro di voler eliminare questo programma?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });
        if (!confirmed) return;

        const deleted = await remove(programmaId);
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
                    <Typography variant="h4">Programmi</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={dialog.openCreate}>
                        Crea Nuovo Programma
                    </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione dei programmi didattici e dei relativi moduli
                </Typography>
            </Box>

            <AsyncContent
                data={programmi}
                error={error}
                onRetry={() => mutate()}
                empty={
                    <EmptyState
                        icon={FolderOffOutlined}
                        title="Nessun programma trovato"
                        description="Inizia aggiungendo un nuovo programma"
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
                        {list.map((p) => (
                            <ProgrammaCard
                                key={p.id}
                                programma={p}
                                onEdit={dialog.openEdit}
                                onDelete={handleDeleteProgramma}
                                onModuliUpdated={() => mutate()}
                            />
                        ))}
                    </Box>
                )}
            </AsyncContent>

            <ProgrammaModal
                open={dialog.open}
                programma={dialog.entity}
                onClose={dialog.close}
                onSuccess={handleSuccess}
            />
        </Container>
    );
}