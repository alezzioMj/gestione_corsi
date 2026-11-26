"use client";

import Link from "next/link";
import { Box, Typography, Container, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { WorkOffOutlined } from "@mui/icons-material";
import useSWR from "swr";

import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { useEntityDialog } from "@/hooks/useEntityDialog";
import AsyncContent from "@/components/AsyncContent";
import EmptyState from "@/components/EmptyState";
import CorsoCard from "@/components/Corsi/CorsoCard";
import CorsoInfoDialog from "@/components/Corsi/CorsoModal";
import { CorsoItem } from "@/components/Corsi/Corso";
import CorsoBozzeDialog from "@/components/Corsi/CorsoBozzeDialog";

export default function CorsiPage() {
    const { data: corsi, error, mutate } = useSWR<CorsoItem[]>('corsi?include=commessa,programma,corso_docente,corso_sede', fetcher);
    const { remove } = useDeleteEntity("/corsi");
    const { confirm } = useConfirm();
    const bozze = useEntityDialog<CorsoItem>();
    const info = useEntityDialog<CorsoItem>();

    const handleDelete = async (corsoId: number) => {
        const confirmed = await confirm({
            title: "Elimina corso",
            message: "Sei sicuro di voler eliminare questo corso? Verranno eliminate anche tutte le sessioni associate.",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });
        if (!confirmed) return;

        const deleted = await remove(corsoId);
        if (deleted) mutate();
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
                    <Typography variant="h4">Corsi</Typography>
                    <Button component={Link} href="/corsi/crea" variant="contained" startIcon={<AddIcon />}>
                        Crea Nuovo Corso
                    </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione dei corsi
                </Typography>
            </Box>

            <AsyncContent
                data={corsi}
                error={error}
                onRetry={() => mutate()}
                empty={
                    <EmptyState
                        icon={WorkOffOutlined}
                        title="Nessun corso trovato"
                        description="Inizia creando un nuovo corso"
                    />
                }
            >
                {(list) => (
                    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                        {list.map((c) => (
                            <CorsoCard key={c.id} corso={c} onInfo={info.openEdit} onBozze={bozze.openEdit} onDelete={handleDelete} />
                        ))}
                    </Box>
                )}
            </AsyncContent>

            <CorsoBozzeDialog open={bozze.open} corso={bozze.entity} onClose={bozze.close} onChanged={() => mutate()} />
            <CorsoInfoDialog open={info.open} corso={info.entity} onClose={info.close} />
        </Container>
    );
}