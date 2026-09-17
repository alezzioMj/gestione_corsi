"use client";

import React, { useMemo, useState } from "react";
import { CalendarMonthOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";

import { RigaCommessa, trasformaSessioniInCommesse } from "@/lib/formatSessioni";

import ScheduleGrid from "@/components/ScheduleGrid/ScheduleGrid";
import DayCellModal from "@/components/ScheduleGrid/DayCellModal";
import EmptyState from "@/components/EmptyState";
import { Alert } from "@mui/material";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { API_ENDPOINTS } from "@/lib/api";
import DelayedLoading from "@/components/DelayedLoading";

export default function SessioniPage() {
    const { data: sessioniData, isLoading: sessioniLoading, error: sessioniError, mutate: sessioniMutate } = useSWR(API_ENDPOINTS.sessioniFull, fetcher);
    const { data: docentiData, isLoading: docentiLoading, error: docentiError, mutate: docentiMutate } = useSWR(API_ENDPOINTS.docenti, fetcher);
    const { data: corsiData, isLoading: corsiLoading, error: corsiError, mutate: corsiMutate } = useSWR(API_ENDPOINTS.corsi, fetcher);


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

    const retry = () => {
        corsiMutate();
        docentiMutate();
        sessioniMutate();
    }

    return (
        <>
            {selectedCellData && (
                <DayCellModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    giorno={new Date(selectedCellData.dateKey)}
                    sessioni={sessioniData}
                />
            )}
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Programmazione Commesse</h1>
                </div>

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
            </div>
        </>
    );
}