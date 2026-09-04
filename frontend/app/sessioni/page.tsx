"use client";

import React, { useEffect, useState } from "react";
// Importiamo il nuovo componente griglia
import ScheduleGrid from "@/components/ScheduleGrid/ScheduleGrid";
// Importiamo la funzione helper dal Passo 1
import { trasformaSessioniInCommesse, RigaCommessa } from "@/lib/formatSessioni";
import { API_BASE_URL } from "@/lib/config";
import { Corso, Docente, SessioneWithRelations } from "@/validation/types";
import DayCellModal from "@/components/ScheduleGrid/DayCellModule";

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

                // Chiamate in parallelo al backend per sessioni e docenti
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

                // Trasformiamo le sessioni in commesse
                const commesseFormattate = trasformaSessioniInCommesse(dataSessioni);

                // Salviamo gli stati
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
                    giorno={new Date(selectedCellData.dateKey)} // O selectedCellData.dateKey se vuole la stringa
                    sessioni={sessioni}
                />
            )}
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Programmazione Commesse</h1>
                </div>

                {/* Renderizziamo il componente Griglia passando i dati trasformati */}
                <ScheduleGrid commesse={commesse} docenti={docenti} corsi={corsi} onCellClick={handleCellClick} />
            </div>
        </>
    );
}