"use client";

import useSWR from "swr";
import React, { useMemo, useState } from "react";
import { CalendarMonthOutlined } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";

import { RigaCommessa, trasformaSessioniInCommesse } from "@/lib/formatSessioni";
import { fetcher } from "@/lib/swr-config";

import ScheduleGrid from "@/components/ScheduleGrid/ScheduleGrid";
import DayCellModal from "@/components/ScheduleGrid/DayCellModal";
import EmptyState from "@/components/EmptyState";
import { Alert } from "@mui/material";
import { API_ENDPOINTS } from "@/lib/api";
import DelayedLoading from "@/components/DelayedLoading";
import AddSessioneModal from "@/components/Sessioni/AddSessioneModal";
import { API_BASE_URL } from "@/lib/config";
import { useConfirm } from "@/components/ConfirmContext";
import { useSnackbar } from "@/components/SnackbarContext";

export default function SessioniPage() {
    const { data: sessioniData, isLoading: sessioniLoading, error: sessioniError, mutate: sessioniMutate } = useSWR(API_ENDPOINTS.sessioniFull, fetcher);
    const { data: docentiData, isLoading: docentiLoading, error: docentiError, mutate: docentiMutate } = useSWR(API_ENDPOINTS.docenti, fetcher);
    const { data: corsiData, isLoading: corsiLoading, error: corsiError, mutate: corsiMutate } = useSWR(API_ENDPOINTS.corsi, fetcher);
    const { showMessage} = useSnackbar();
    const {confirm} = useConfirm();

    const isLoading = corsiLoading || sessioniLoading || docentiLoading;
    const error = corsiError || sessioniError || docentiError;

    const commesse = useMemo<RigaCommessa[]>(() => {
        if (error || !sessioniData || !corsiData || !docentiData) {
            return [];
        }
        return trasformaSessioniInCommesse(sessioniData, corsiData, docentiData)
    },
        [sessioniData, docentiData, corsiData, error]
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCellData, setSelectedCellData] = useState<{ dateKey: string; commessaId?: number } | null>(null);

    const handleCellClick = (dateKey: string, commessaId?: number) => {
        setSelectedCellData({ dateKey, commessaId });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCellData(null);
    };

    const handleDeleteSessione = async (sessioneId: number) => {
        const ok = await confirm({
            title: "Elimina sessione",
            message: "Sei sicuro di voler eliminare questa sessione?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        }
        )
        if (!ok) return;
        try {
            const res = await fetch(`${API_BASE_URL}/sessioni/${sessioneId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione della sessione: ${res.statusText}`);
            }
            //Update SWR cache 
            sessioniMutate();
            showMessage("Sede eliminata con successo!");
        } catch (error) {
            if (!(error instanceof Error)) {
                console.error("Errore sconosciuto nell'eliminazione della sessione:", error);
                return;
            }
            showMessage(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione della sessione:", error);
        }
    };

    const retry = () => {
        corsiMutate();
        docentiMutate();
        sessioniMutate();
    }

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            {selectedCellData && (
                <DayCellModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    giorno={new Date(selectedCellData.dateKey)}
                    sessioni={sessioniData}
                    onDeleteSessione={ handleDeleteSessione }
                />
            )}
            <Box sx={{
                mb: 4
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                }}>
                    <Typography variant="h4">Programmazione sessioni</Typography>
                    <AddSessioneModal onSessioneAdded={sessioniMutate} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {" Gestione delle sessioni "}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }} action={<Button color="inherit" size="small" onClick={retry}>Riprova</Button>}>
                    {error.message}
                </Alert>
            )}

            {isLoading ? (
                <DelayedLoading />
            ) : !corsiData || corsiData.length === 0 ?
                <EmptyState
                    icon={CalendarMonthOutlined}
                    title={"Nessuna sessione trovata"}
                    description={"Inizia creando una nuova commessa"}
                />
                :
                <ScheduleGrid commesse={commesse} docenti={docentiData} corsi={corsiData} onCellClick={handleCellClick} />
            }
        </Container>
    );
}