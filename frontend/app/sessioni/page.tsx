"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { Alert, Box, Button, Chip, Container, Typography } from "@mui/material";
import { CalendarMonthOutlined } from "@mui/icons-material";

import { Docente } from "@progetto/shared/validation/types";

import { API_ENDPOINTS } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
import { fetcher } from "@/lib/swr-config";

import DelayedLoading from "@/components/DelayedLoading";
import EmptyState from "@/components/EmptyState";
import { useConfirm } from "@/components/ConfirmContext";
import { useSnackbar } from "@/components/SnackbarContext";
import AddSessioneModal from "@/components/Sessioni/AddSessioneModal";
import DayCellModal from "@/components/ScheduleGrid/DayCellModal";
import ScheduleGrid from "@/components/ScheduleGrid/ScheduleGrid";
import { sessioniToRows } from "@/components/ScheduleGrid/adapters";
import { CalendarRow } from "@/components/ScheduleGrid/types";

export default function SessioniPage() {
    const { data: sessioniData, isLoading: sessioniLoading, error: sessioniError, mutate: sessioniMutate } = useSWR(API_ENDPOINTS.sessioniFull, fetcher);
    const { data: docentiData, isLoading: docentiLoading, error: docentiError, mutate: docentiMutate } = useSWR(API_ENDPOINTS.docenti, fetcher);
    const { data: corsiData, isLoading: corsiLoading, error: corsiError, mutate: corsiMutate } = useSWR(API_ENDPOINTS.corsi, fetcher);
    const { showMessage } = useSnackbar();
    const { confirm } = useConfirm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCellData, setSelectedCellData] = useState<{ dateKey: string; commessaId?: number } | null>(null);

    const isLoading = corsiLoading || sessioniLoading || docentiLoading;
    const error = corsiError || sessioniError || docentiError;

    const rows = useMemo<CalendarRow[]>(() => {
        if (error || !sessioniData || !corsiData || !docentiData) {
            return [];
        }
        return sessioniToRows(corsiData, sessioniData);
    }, [sessioniData, docentiData, corsiData, error]);

    const legend = useMemo(() => {
        const docenti: Docente[] = Array.isArray(docentiData) ? docentiData : [];
        return (
            <>
                <Typography variant="caption" sx={{ color: "grey.400", fontWeight: 600, mr: 1 }}>
                    Docenti:
                </Typography>
                {docenti.map((doc) => (
                    <Chip
                        key={doc.codice_fiscale}
                        size="small"
                        label={`${doc.nome} ${doc.cognome}`}
                        sx={{ bgcolor: doc.colore || "#e5e7eb", color: "black", fontWeight: 500 }}
                    />
                ))}
                <Chip
                    size="small"
                    label="Docente non assegnato"
                    sx={{ bgcolor: "#9ca3af", color: "black", fontWeight: 500 }}
                />
            </>
        );
    }, [docentiData]);

    /*
    const handleCellClick = (dateKey: string, rowId?: CalendarRow["id"]) => {
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
        });
        if (!ok) return;

        try {
            const res = await fetch(`${API_BASE_URL}/sessioni/${sessioneId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione della sessione: ${res.statusText}`);
            }
            // Aggiorna la cache SWR
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
    };
    */

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            {/* selectedCellData && (
                <DayCellModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    giorno={new Date(selectedCellData.dateKey)}
                    sessioni={sessioniData}
                    onDeleteSessione={handleDeleteSessione}
                />
            ) */}

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
                    <Typography variant="h4">Programmazione sessioni</Typography>
                    <AddSessioneModal onSessioneAdded={sessioniMutate} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {" Gestione delle sessioni "}
                </Typography>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 4 }}
                    action={<Button color="inherit" size="small" onClick={retry}>Riprova</Button>}
                >
                    {error.message}
                </Alert>
            )}

            {isLoading ? (
                <DelayedLoading />
            ) : !corsiData || corsiData.length === 0 ? (
                <EmptyState
                    icon={CalendarMonthOutlined}
                    title="Nessuna sessione trovata"
                    description="Inizia creando una nuova commessa"
                />
            ) : (
                <ScheduleGrid rows={rows} legend={legend} onCellClick={() => 1} />
            )}
        </Container>
    );
}