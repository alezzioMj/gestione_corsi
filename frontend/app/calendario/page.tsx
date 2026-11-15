"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { Alert, Box, Button, Chip, Container, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { CalendarMonthOutlined } from "@mui/icons-material";

import { Aula, Docente, Sede } from "@progetto/shared/validation/types";

import { API_ENDPOINTS } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
import { fetcher } from "@/lib/swr-config";

import DelayedLoading from "@/components/DelayedLoading";
import EmptyState from "@/components/EmptyState";
import { useConfirm } from "@/components/ConfirmContext";
import { useSnackbar } from "@/components/SnackbarContext";
import AddSessioneModal from "@/components/Sessioni/AddSessioneModal";
import DayCellModal from "@/components/ScheduleGrid/DayCellModal";
import IndisponibilitaModal, { IndisponibilitaConId } from "@/components/ScheduleGrid/IndisponibilitaModal";
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

    // Indisponibilità della riga cliccata (viste docenti, aule e sedi).
    // Il filtro per giorno lo fa IndisponibilitaModal.
    const indispModal = useMemo<IndisponibilitaConId[]>(() => {
        if (!selectedCellData || vista === "sessioni" || !Array.isArray(indispData)) return [];
        const { rowId } = selectedCellData;

        return indispData.filter((i: IndisponibilitaConId) => {
            switch (vista) {
                case "docenti": return i.docente_cf === rowId;
                case "aule": return i.aula_id === rowId;
                case "sedi": return i.sede_id === rowId;
                default: return false;
            }
        });
    }, [selectedCellData, vista, indispData]);

    // Nome del docente, aula o sede cliccati, mostrato nel titolo del modale
    const titoloIndispModal = useMemo(() => {
        if (!selectedCellData) return undefined;
        const { rowId } = selectedCellData;

        if (vista === "docenti") {
            const docenti: Docente[] = Array.isArray(docentiData) ? docentiData : [];
            const d = docenti.find((doc) => doc.codice_fiscale === rowId);
            return d ? `${d.nome} ${d.cognome}` : undefined;
        }
        if (vista === "aule") {
            const aule: Aula[] = Array.isArray(auleData) ? auleData : [];
            return aule.find((a) => a.id === rowId)?.nome;
        }
        if (vista === "sedi") {
            const sedi: Sede[] = Array.isArray(sediData) ? sediData : [];
            return sedi.find((s) => s.id === rowId)?.nome;
        }
        return undefined;
    }, [selectedCellData, vista, docentiData, auleData, sediData]);

    const handleCellClick = (dateKey: string, rowId?: CalendarRow["id"]) => {
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

    const handleDeleteIndisponibilita = async (indisponibilitaId: number) => {
        const ok = await confirm({
            title: "Elimina indisponibilità",
            message: "Sei sicuro di voler eliminare questa indisponibilità?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        });
        if (!ok) return;

        try {
            const res = await fetch(`${API_BASE_URL}/indisponibilita/${indisponibilitaId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(
                    errorData.error ||
                    errorData.message ||
                    `Errore durante l'eliminazione dell'indisponibilità: ${res.statusText}`
                );
            }
            // Aggiorna la cache SWR: la griglia e il modale si aggiornano da soli
            indispMutate();
            showMessage("Indisponibilità eliminata con successo!");
        } catch (error) {
            if (!(error instanceof Error)) {
                console.error("Errore sconosciuto nell'eliminazione dell'indisponibilità:", error);
                return;
            }
            showMessage(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione dell'indisponibilità:", error);
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