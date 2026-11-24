"use client";

import DocenteCard from "@/components/Docenti/DocenteCard";
import { Box, Typography, Container, Paper, Button } from "@mui/material";
import { Docente } from "@progetto/shared/validation/docente.schema";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import EmptyState from "@/components/EmptyState";
import { PersonOffOutlined } from "@mui/icons-material";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { useEntityDialog } from "@/hooks/useEntityDialog";
import AsyncContent from "@/components/AsyncContent";
import DocenteModal from "@/components/Docenti/DocenteModal";
import AddIcon from "@mui/icons-material/Add"

export default function DocentiPage() {
    const { data: docenti, error, mutate } = useSWR<Docente[]>("/docenti", fetcher);
    const { remove } = useDeleteEntity("/docenti");
    const { confirm } = useConfirm();
    const dialog = useEntityDialog<Docente>();

    const handleDeleteDocente = async (docente_cf: string) => {
        const confirmed = await confirm({
            title: "Elimina docente",
            message: "Sei sicuro di voler eliminare questo docente?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });
        if (!confirmed) return;

        const deleted = await remove(docente_cf);
        if (deleted) mutate();
    };

    const handleSuccess = () => {
        mutate();
        dialog.close();
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
                    <Typography variant="h4">Docenti</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={dialog.openCreate}>
                        Crea Nuovo Docente
                    </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {" Gestione dell'anagrafica docenti e dei relativi contatti. "}
                </Typography>
            </Box>

            <AsyncContent
                data={docenti}
                error={error}
                onRetry={() => mutate()}
                empty={
                    <EmptyState
                        icon={PersonOffOutlined}
                        title="Nessun docente trovato"
                        description="Inizia aggiungendo un nuovo docente"
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
                        {
                            list.map((d) => (
                                <Paper key={d.codice_fiscale} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <DocenteCard
                                        docente={d}
                                        onEdit={() => mutate()} // Passa la funzione di refresh
                                        onDelete={handleDeleteDocente} // Passa la funzione di eliminazione
                                    />
                                </Paper>
                            ))
                        }
                    </Box>
                )}
            </AsyncContent>
            <DocenteModal
                open={dialog.open}
                docente={dialog.entity}
                onClose={dialog.close}
                onSuccess={handleSuccess}
            />
        </Container>
    );
}