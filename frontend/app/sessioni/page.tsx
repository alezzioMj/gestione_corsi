"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { Alert, Box, Button, Chip, Container, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
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
import {
    sessioniToRows,
    indisponibilitaDocentiToRows,
    indisponibilitaAuleToRows,
    indisponibilitaSediToRows,
} from "@/components/ScheduleGrid/adapters";
import { CalendarRow } from "@/components/ScheduleGrid/types";

type Vista = "sessioni" | "docenti" | "aule" | "sedi";

const VISTE: { value: Vista; label: string; headerLeft: string }[] = [
    { value: "sessioni", label: "Sessioni", headerLeft: "CORSO" },
    { value: "docenti", label: "Indisponibilità docenti", headerLeft: "DOCENTE" },
    { value: "aule", label: "Indisponibilità aule", headerLeft: "AULA" },
    { value: "sedi", label: "Indisponibilità sedi", headerLeft: "SEDE" },
];

const COLORE_INDISP = "#f87171";

export default function SessioniPage() {
    const { data: sessioniData, isLoading: sessioniLoading, error: sessioniError, mutate: sessioniMutate } = useSWR(API_ENDPOINTS.sessioniFull, fetcher);
    const { data: docentiData, isLoading: docentiLoading, error: docentiError, mutate: docentiMutate } = useSWR(API_ENDPOINTS.docenti, fetcher);
    const { data: corsiData, isLoading: corsiLoading, error: corsiError, mutate: corsiMutate } = useSWR(API_ENDPOINTS.corsi, fetcher);
    const { data: indispData, isLoading: indispLoading, error: indispError, mutate: indispMutate } = useSWR(API_ENDPOINTS.indisponibilita, fetcher);
    const { data: sediData, isLoading: sediLoading, error: sediError, mutate: sediMutate } = useSWR(API_ENDPOINTS.sedi, fetcher);
    const { data: auleData, isLoading: auleLoading, error: auleError, mutate: auleMutate } = useSWR(API_ENDPOINTS.aule, fetcher);

    const { showMessage } = useSnackbar();
    const { confirm } = useConfirm();

    const [vista, setVista] = useState<Vista>("sessioni");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCellData, setSelectedCellData] = useState<{ dateKey: string; rowId?: CalendarRow["id"] } | null>(null);

    const isLoading = corsiLoading || sessioniLoading || docentiLoading || indispLoading || sediLoading || auleLoading;
    const error = corsiError || sessioniError || docentiError || indispError || sediError || auleError;

    const rows = useMemo<CalendarRow[]>(() => {
        if (error) return [];

        switch (vista) {
            case "sessioni":
                return Array.isArray(corsiData) && Array.isArray(sessioniData)
                    ? sessioniToRows(corsiData, sessioniData)
                    : [];
            case "docenti":
                return Array.isArray(docentiData) && Array.isArray(indispData)
                    ? indisponibilitaDocentiToRows(docentiData, indispData)
                    : [];
            case "aule":
                return Array.isArray(auleData) && Array.isArray(indispData)
                    ? indisponibilitaAuleToRows(auleData, indispData)
                    : [];
            case "sedi":
                return Array.isArray(sediData) && Array.isArray(indispData)
                    ? indisponibilitaSediToRows(sediData, indispData)
                    : [];
        }
    }, [vista, error, corsiData, sessioniData, docentiData, indispData, auleData, sediData]);

    const legend = useMemo(() => {
        const docenti: Docente[] = Array.isArray(docentiData) ? docentiData : [];

        // Aule e sedi: un solo colore, quello delle indisponibilità
        if (vista === "aule" || vista === "sedi") {
            return (
                <Chip
                    size="small"
                    label="X = indisponibile"
                    sx={{ bgcolor: COLORE_INDISP, color: "black", fontWeight: 500 }}
                />
            );
        }

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
                {vista === "sessioni" ? (
                    <Chip
                        size="small"
                        label="Docente non assegnato"
                        sx={{ bgcolor: "#9ca3af", color: "black", fontWeight: 500 }}
                    />
                ) : (
                    <Chip
                        size="small"
                        label="X = indisponibile"
                        sx={{ bgcolor: COLORE_INDISP, color: "black", fontWeight: 500 }}
                    />
                )}
            </>
        );
    }, [vista, docentiData]);

    const headerLeft = useMemo(() => {
        const label = VISTE.find((v) => v.value === vista)?.headerLeft ?? "";
        return (
            <Box
                sx={{
                    flex: 1,
                    p: 1,
                    bgcolor: "#1e3a8a",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {label}
            </Box>
        );
    }, [vista]);

    // Sessioni del corso cliccato (solo vista "sessioni")
    const sessioniModal = useMemo(() => {
        if (!selectedCellData || !Array.isArray(sessioniData)) return [];
        return sessioniData.filter((s: { corso_id: number }) => s.corso_id === selectedCellData.rowId);
    }, [selectedCellData, sessioniData]);

    const handleCellClick = (dateKey: string, rowId?: CalendarRow["id"]) => {
        if (vista !== "sessioni") return; // per le indisponibilità non c'è ancora un modal
        setSelectedCellData({ dateKey, rowId });
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
            showMessage("Sessione eliminata con successo!");
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
        indispMutate();
        sediMutate();
        auleMutate();
    };

    // "YYYY-MM-DD" -> Date a mezzanotte locale (new Date("YYYY-MM-DD") sarebbe UTC)
    const dateFromKey = (key: string) => {
        const [y, m, d] = key.split("-").map(Number);
        return new Date(y, m - 1, d);
    };

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            {selectedCellData && (
                <DayCellModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    giorno={dateFromKey(selectedCellData.dateKey)}
                    sessioni={sessioniModal}
                    onDeleteSessione={handleDeleteSessione}
                />
            )}

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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {" Gestione delle sessioni "}
                </Typography>

                <ToggleButtonGroup
                    exclusive
                    size="small"
                    color="primary"
                    value={vista}
                    onChange={(_, v: Vista | null) => v && setVista(v)}
                >
                    {VISTE.map((v) => (
                        <ToggleButton key={v.value} value={v.value}>
                            {v.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
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
            ) : rows.length === 0 ? (
                <EmptyState
                    icon={CalendarMonthOutlined}
                    title={vista === "sessioni" ? "Nessuna sessione trovata" : "Nessun elemento da mostrare"}
                    description={vista === "sessioni" ? "Inizia creando una nuova commessa" : "Non ci sono dati per questa vista"}
                />
            ) : (
                <ScheduleGrid rows={rows} legend={legend} headerLeft={headerLeft} onCellClick={handleCellClick} />
            )}
        </Container>
    );
}