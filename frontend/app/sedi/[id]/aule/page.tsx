"use client";
import { Box, Typography, Container, Button } from "@mui/material";
import Link from "next/link";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from "react";
import AddAulaModal from "@/components/Aule/AddAulaModal";
import AulaCard from "@/components/Aule/AulaCard";
import { Aula } from "@shared/validation/types";
import { useParams } from "next/navigation";
import useSWR from "swr";
import DelayedLoading from "@/components/DelayedLoading";
import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import { useSnackbar } from "@/components/SnackbarContext";
import { API_ENDPOINTS } from "@/lib/api";

export default function AuleSedePage() {
    const resolvedParams = useParams();
    const sedeId = resolvedParams.id;

    const { data: sede, error, isLoading, mutate } = useSWR(
        sedeId ? `${API_ENDPOINTS.sedi}${sedeId}` : null,
        fetcher
    );
    const { confirm } = useConfirm();
    const { showMessage } = useSnackbar();

    const handleDeleteAula = async (aulaId: number) => {
        const ok = await confirm({
            title: "Elimina aula",
            message: "Sei sicuro di voler eliminare quest'aula?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        }
        )
        if (!ok) return;
        try {
            const res = await fetch(`${API_ENDPOINTS.aule}${aulaId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione dell'aula: ${res.statusText}`);
            }
            //Update SWR cache 
            mutate();
            showMessage("Aula eliminata con successo!");
        } catch (error) {
            if (!(error instanceof Error)) {
                console.error("Errore sconosciuto nell'eliminazione della sede:", error);
                return;
            }
            showMessage(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione dell'aula:", error);
        }
    }

    if (isLoading) return <DelayedLoading />;

    if (error || !sede) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h6" color="error">
                    Sede con ID &quot;{sedeId}&quot; non trovata.
                </Typography>
                <Link href="/sedi">Torna alla lista delle Sedi</Link>
            </Container>
        );
    }

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/sedi" style={{ textDecoration: 'none' }}>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />}>
                        Torna alle Sedi
                    </Button>
                </Link>
                <AddAulaModal sedeId={Number(sedeId)} onAulaAdded={() => mutate()} />
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Aule - {sede.nome}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {sede.indirizzo}, {sede.citta} ({sede.provincia})
                </Typography>
            </Box>

            <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 2 }}>
                {sede.aula && sede.aula.length > 0 ? (
                    sede.aula.map((a: Aula) => (
                        <AulaCard
                            key={a.id}
                            aula={a}
                            onAulaUpdated={() => { mutate() }}
                            onDeleteAula={() => { handleDeleteAula(a.id) }}
                        />
                    ))
                ) : (
                    <Typography color="text.secondary">
                        Nessuna aula configurata per questa sede.
                    </Typography>
                )}
            </Box>
        </Container>
    );
}