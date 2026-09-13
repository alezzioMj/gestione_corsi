"use client";

import React,{ useEffect, useState } from "react";
import { CalendarMonthOutlined } from "@mui/icons-material";

import { API_BASE_URL } from "@/lib/config";
import { Corso, Docente, SessioneWithRelations } from "@shared/validation/types";
import { trasformaSessioniInCommesse, RigaCommessa } from "@/lib/formatSessioni";

import ScheduleGrid from "@/components/ScheduleGrid/ScheduleGrid";
import DayCellModal from "@/components/ScheduleGrid/DayCellModal";
import EmptyState from "@/components/EmptyState";

export default function SessioniPage() {
    const [commesse, setCommesse] = useState<RigaCommessa[]>([]);
    const [sessioni, setSessioni] = useState<SessioneWithRelations[]>([]);
    const [docenti, setDocenti] = useState<Docente[]>([]);
    const [corsi, setCorsi] = useState<Corso[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [resSessioni, resDocenti, resCorsi] = await Promise.all([
                    fetch(`${API_BASE_URL}/sessioni/full`),
                    fetch(`${API_BASE_URL}/docenti`),
                    fetch(`${API_BASE_URL}/corsi`)
                ]);

                if (!resSessioni.ok) {
                    throw new Error("Errore durante il recupero delle sessioni");
                }
                if (!resDocenti.ok) {
                    throw new Error("Errore durante il recupero dei docenti");
                }
                if (!resCorsi.ok) {
                    throw new Error("Errore durante il recupero dei corsi");
                }

                const dataSessioni = await resSessioni.json();
                const dataDocenti: Docente[] = await resDocenti.json();
                const dataCorsi: Corso[] = await resCorsi.json();

                const commesseFormattate = trasformaSessioniInCommesse(dataSessioni);

                setCommesse(commesseFormattate);
                setSessioni(dataSessioni);
                setDocenti(dataDocenti);
                setCorsi(dataCorsi);
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Errore sconosciuto";
                setError(msg);
                console.error("Errore fetch dati:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-white flex items-center justify-center">
                <div className="text-lg">Caricamento programmazione in corso...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-red-400">
                <div className="text-lg font-bold">Si è verificato un errore:</div>
                <div>{error}</div>
            </div>
        );
    }

    return (
        <>
            {selectedCellData && (
                <DayCellModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    giorno={new Date(selectedCellData.dateKey)}
                    sessioni={sessioni}
                />
            )}
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Programmazione Commesse</h1>
                </div>

                {
                    !corsi || corsi.length === 0?
                        <EmptyState
                            icon={CalendarMonthOutlined}
                            title={"Nessuna sessione trovata"}
                            description={"Inizia creando una nuova commessa"}
                        />
                        :
                        <ScheduleGrid commesse={commesse} docenti={docenti} corsi={corsi} onCellClick={handleCellClick} />
                }
                 </div>
        </>
    );
}