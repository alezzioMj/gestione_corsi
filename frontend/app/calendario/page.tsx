
"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";

import {
    Box,
    Button,
    Chip,
    Container,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";

import { CalendarMonthOutlined } from "@mui/icons-material";

import type { Aula } from "@progetto/shared/validation/aula.schema";
import type { Docente } from "@progetto/shared/validation/docente.schema";
import type { Sede } from "@progetto/shared/validation/sede.schema";

import { API_ENDPOINTS } from "@/lib/api";
import { fetcher } from "@/lib/swr-config";

import EmptyState from "@/components/EmptyState";
import AsyncContent from "@/components/AsyncContent";
import { useConfirm } from "@/components/ConfirmContext";

import SessioneModal from "@/components/Sessioni/SessioneModal";
import DayCellModal from "@/components/ScheduleGrid/DayCellModal";

import IndisponibilitaModal, {
    IndisponibilitaConId,
} from "@/components/ScheduleGrid/IndisponibilitaModal";

import ScheduleGrid from "@/components/ScheduleGrid/ScheduleGrid";

import {
    sessioniToRows,
    indisponibilitaDocentiToRows,
    indisponibilitaAuleToRows,
    indisponibilitaSediToRows,
} from "@/components/ScheduleGrid/adapters";

import { CalendarRow } from "@/components/ScheduleGrid/types";

import { useDeleteEntity } from "@/hooks/useDeleteEntity";

type Vista = "sessioni" | "docenti" | "aule" | "sedi";

const VISTE: {
    value: Vista;
    label: string;
    headerLeft: string;
}[] = [
    { value: "sessioni", label: "Sessioni", headerLeft: "CORSO" },
    { value: "docenti", label: "Indisponibilità docenti", headerLeft: "DOCENTE" },
    { value: "aule", label: "Indisponibilità aule", headerLeft: "AULA" },
    { value: "sedi", label: "Indisponibilità sedi", headerLeft: "SEDE" },
];

const COLORE_INDISP = "#f87171";

export default function SessioniPage() {
    // --------------------------------------------------
    // SWR
    // --------------------------------------------------

    const {
        data: sessioniData,
        isLoading: sessioniLoading,
        error: sessioniError,
        mutate: sessioniMutate,
    } = useSWR(API_ENDPOINTS.sessioniFull, fetcher);

    const {
        data: docentiData,
        isLoading: docentiLoading,
        error: docentiError,
        mutate: docentiMutate,
    } = useSWR(API_ENDPOINTS.docenti, fetcher);

    const {
        data: corsiData,
        isLoading: corsiLoading,
        error: corsiError,
        mutate: corsiMutate,
    } = useSWR(API_ENDPOINTS.corsi, fetcher);

    const {
        data: indispData,
        isLoading: indispLoading,
        error: indispError,
        mutate: indispMutate,
    } = useSWR(API_ENDPOINTS.indisponibilita, fetcher);

    const {
        data: sediData,
        isLoading: sediLoading,
        error: sediError,
        mutate: sediMutate,
    } = useSWR(API_ENDPOINTS.sedi, fetcher);

    const {
        data: auleData,
        isLoading: auleLoading,
        error: auleError,
        mutate: auleMutate,
    } = useSWR(API_ENDPOINTS.aule, fetcher);

    // --------------------------------------------------
    // Hooks
    // --------------------------------------------------

    const { confirm } = useConfirm();

    const { remove: removeSessione } = useDeleteEntity("/sessioni");

    const { remove: removeIndisponibilita } =
        useDeleteEntity("/indisponibilita");

    // --------------------------------------------------
    // State
    // --------------------------------------------------

    const [vista, setVista] = useState<Vista>("sessioni");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [selectedCellData, setSelectedCellData] = useState<{
        dateKey: string;
        rowId?: CalendarRow["id"];
    } | null>(null);

    // --------------------------------------------------
    // Async status
    // --------------------------------------------------

    const isLoading =
        corsiLoading ||
        sessioniLoading ||
        docentiLoading ||
        indispLoading ||
        sediLoading ||
        auleLoading;

    const error =
        corsiError ||
        sessioniError ||
        docentiError ||
        indispError ||
        sediError ||
        auleError;

    // --------------------------------------------------
    // Calendar rows
    // --------------------------------------------------

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
    }, [
        vista,
        error,
        corsiData,
        sessioniData,
        docentiData,
        indispData,
        auleData,
        sediData,
    ]);

    // --------------------------------------------------
    // Legend
    // --------------------------------------------------

    const legend = useMemo(() => {
        const docenti: Docente[] = Array.isArray(docentiData)
            ? docentiData
            : [];

        if (vista === "aule" || vista === "sedi") {
            return (
                <Chip
                    size="small"
                    label="X = indisponibile"
                    sx={{
                        bgcolor: COLORE_INDISP,
                        color: "black",
                        fontWeight: 500,
                    }}
                />
            );
        }

        return (
            <>
                <Typography
                    variant="caption"
                    sx={{
                        color: "grey.400",
                        fontWeight: 600,
                        mr: 1,
                    }}
                >
                    Docenti:
                </Typography>

                {docenti.map((doc) => (
                    <Chip
                        key={doc.codice_fiscale}
                        size="small"
                        label={`${doc.nome} ${doc.cognome}`}
                        sx={{
                            bgcolor: doc.colore || "#e5e7eb",
                            color: "black",
                            fontWeight: 500,
                        }}
                    />
                ))}

                {vista === "sessioni" ? (
                    <Chip
                        size="small"
                        label="Docente non assegnato"
                        sx={{
                            bgcolor: "#9ca3af",
                            color: "black",
                            fontWeight: 500,
                        }}
                    />
                ) : (
                    <Chip
                        size="small"
                        label="X = indisponibile"
                        sx={{
                            bgcolor: COLORE_INDISP,
                            color: "black",
                            fontWeight: 500,
                        }}
                    />
                )}
            </>
        );
    }, [vista, docentiData]);

    // --------------------------------------------------
    // Calendar header
    // --------------------------------------------------

    const headerLeft = useMemo(() => {
        const label =
            VISTE.find((v) => v.value === vista)?.headerLeft ?? "";

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

    // --------------------------------------------------
    // Modal data
    // --------------------------------------------------

    const sessioniModal = useMemo(() => {
        if (!selectedCellData || !Array.isArray(sessioniData)) {
            return [];
        }

        return sessioniData.filter(
            (s: { corso_id: number }) =>
                s.corso_id === selectedCellData.rowId
        );
    }, [selectedCellData, sessioniData]);

    const indispModal = useMemo<IndisponibilitaConId[]>(() => {
        if (
            !selectedCellData ||
            vista === "sessioni" ||
            !Array.isArray(indispData)
        ) {
            return [];
        }

        const { rowId } = selectedCellData;

        return indispData.filter((i: IndisponibilitaConId) => {
            switch (vista) {
                case "docenti":
                    return i.docente_cf === rowId;

                case "aule":
                    return i.aula_id === rowId;

                case "sedi":
                    return i.sede_id === rowId;

                default:
                    return false;
            }
        });
    }, [selectedCellData, vista, indispData]);

    const titoloIndispModal = useMemo(() => {
        if (!selectedCellData) return undefined;

        const { rowId } = selectedCellData;

        if (vista === "docenti") {
            const docenti: Docente[] = Array.isArray(docentiData)
                ? docentiData
                : [];

            const d = docenti.find(
                (doc) => doc.codice_fiscale === rowId
            );

            return d ? `${d.nome} ${d.cognome}` : undefined;
        }

        if (vista === "aule") {
            const aule: Aula[] = Array.isArray(auleData)
                ? auleData
                : [];

            return aule.find((a) => a.id === rowId)?.nome;
        }

        if (vista === "sedi") {
            const sedi: Sede[] = Array.isArray(sediData)
                ? sediData
                : [];

            return sedi.find((s) => s.id === rowId)?.nome;
        }

        return undefined;
    }, [selectedCellData, vista, docentiData, auleData, sediData]);

    // --------------------------------------------------
    // Modal handlers
    // --------------------------------------------------

    const handleCellClick = (
        dateKey: string,
        rowId?: CalendarRow["id"]
    ) => {
        setSelectedCellData({ dateKey, rowId });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCellData(null);
    };

    // --------------------------------------------------
    // Delete handlers
    // --------------------------------------------------

    const handleDeleteSessione = async (sessioneId: number) => {
        const ok = await confirm({
            title: "Elimina sessione",
            message: "Sei sicuro di voler eliminare questa sessione?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });

        if (!ok) return;

        const deleted = await removeSessione(sessioneId);

        if (deleted) {
            await sessioniMutate();
        }
    };

    const handleDeleteIndisponibilita = async (
        indisponibilitaId: number
    ) => {
        const ok = await confirm({
            title: "Elimina indisponibilità",
            message: "Sei sicuro di voler eliminare questa indisponibilità?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });

        if (!ok) return;

        const deleted = await removeIndisponibilita(indisponibilitaId);

        if (deleted) {
            await indispMutate();
        }
    };

    // --------------------------------------------------
    // Retry
    // --------------------------------------------------

    const retry = () => {
        corsiMutate();
        docentiMutate();
        sessioniMutate();
        indispMutate();
        sediMutate();
        auleMutate();
    };

    // --------------------------------------------------
    // Date helper
    // --------------------------------------------------

    const dateFromKey = (key: string) => {
        const [y, m, d] = key.split("-").map(Number);
        return new Date(y, m - 1, d);
    };

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (
        <Container
            disableGutters
            maxWidth={false}
            sx={{ py: 2, px: 3 }}
        >
            {/* Cell modals */}

            {selectedCellData && (
                vista === "sessioni" ? (
                    <DayCellModal
                        open={isModalOpen}
                        onClose={handleCloseModal}
                        giorno={dateFromKey(selectedCellData.dateKey)}
                        sessioni={sessioniModal}
                        onDeleteSessione={handleDeleteSessione}
                    />
                ) : (
                    <IndisponibilitaModal
                        open={isModalOpen}
                        onClose={handleCloseModal}
                        dateKey={selectedCellData.dateKey}
                        titolo={titoloIndispModal}
                        indisponibilita={indispModal}
                        onDelete={handleDeleteIndisponibilita}
                    />
                )
            )}

            {/* Create session modal */}

            <SessioneModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    sessioniMutate();
                }}
            />

            {/* Page header */}

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
                    <Typography variant="h4">
                        Programmazione sessioni
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Nuova sessione
                    </Button>
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    Gestione delle sessioni
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

            {/* Async content */}

            <AsyncContent
                data={isLoading ? undefined : rows}
                error={error}
                onRetry={retry}
                empty={
                    <EmptyState
                        icon={CalendarMonthOutlined}
                        title={
                            vista === "sessioni"
                                ? "Nessuna sessione trovata"
                                : "Nessun elemento da mostrare"
                        }
                        description={
                            vista === "sessioni"
                                ? "Inizia creando una nuova sessione"
                                : "Non ci sono dati per questa vista"
                        }
                    />
                }
            >
                {(data) => (
                    <ScheduleGrid
                        rows={data}
                        legend={legend}
                        headerLeft={headerLeft}
                        onCellClick={handleCellClick}
                    />
                )}
            </AsyncContent>
        </Container>
    );
}
