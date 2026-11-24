"use client";

import { Box, Typography, Container, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";

import type { Aula } from "@progetto/shared/validation/aula.schema";
import type { SedeWithRelations } from "@progetto/shared/validation/sede.schema";
import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { useEntityDialog } from "@/hooks/useEntityDialog";
import AsyncContent from "@/components/AsyncContent";
import DelayedLoading from "@/components/DelayedLoading";
import AulaCard from "@/components/Aule/AulaCard";
import AulaModal from "@/components/Aule/AulaModal";
import { API_BASE_URL } from "@/lib/config";

export default function AuleSedePage() {
    const params = useParams<{ id: string }>();
    const sedeId = Number(params.id);

    const { data: sede, error, isLoading, mutate } = useSWR<SedeWithRelations<"aula">>(
        Number.isFinite(sedeId) ? `${API_BASE_URL}/sedi/${sedeId}?include=aula` : null,
        fetcher
    );
    const { remove } = useDeleteEntity("/aule");
    const { confirm } = useConfirm();
    const dialog = useEntityDialog<Aula>();

    const handleDeleteAula = async (aulaId: number) => {
        const confirmed = await confirm({
            title: "Elimina aula",
            message: "Sei sicuro di voler eliminare quest'aula?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });
        if (!confirmed) return;

        const deleted = await remove(aulaId);
        if (deleted) mutate();
    };

    const handleSuccess = () => {
        mutate();
        dialog.close();
    };

    if (isLoading) return <DelayedLoading />;

    if (error || !sede) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h6" color="error">
                    Sede con ID &quot;{params.id}&quot; non trovata.
                </Typography>
                <Link href="/sedi">Torna alla lista delle Sedi</Link>
            </Container>
        );
    }

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Button component={Link} href="/sedi" variant="outlined" startIcon={<ArrowBackIcon />}>
                    Torna alle Sedi
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={dialog.openCreate}>
                    Aggiungi Aula
                </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Aule - {sede.nome}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {sede.indirizzo}, {sede.citta} ({sede.provincia})
                </Typography>
            </Box>

            <AsyncContent
                data={sede.aula ?? []}
                empty={<Typography color="text.secondary">Nessuna aula configurata per questa sede.</Typography>}
            >
                {(aule) => (
                    <Box
                        sx={{
                            width: "100%",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                            gap: 2,
                        }}
                    >
                        {aule.map((a) => (
                            <AulaCard key={a.id} aula={a} onEdit={dialog.openEdit} onDelete={handleDeleteAula} />
                        ))}
                    </Box>
                )}
            </AsyncContent>

            <AulaModal
                open={dialog.open}
                aula={dialog.entity}
                sedeId={sedeId}
                onClose={dialog.close}
                onSuccess={handleSuccess}
            />
        </Container>
    );
}