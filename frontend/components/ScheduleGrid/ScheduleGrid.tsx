"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";

import { RigaCommessa } from "@/lib/formatSessioni";
import { Docente } from "@progetto/shared/validation/types";
import { Corso } from "@progetto/shared/validation/types";

import DayCell from "./DayCell";
import SessioneModal from "../Sessioni/AddSessioneModal";

const MESI = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

const GIORNI_SETTIMANA = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

interface ScheduleGridProps {
    commesse?: RigaCommessa[];
    docenti?: Docente[];
    corsi?: Corso[];
    onCellClick: (dateKey: string, commessaId?: number) => void;
}

interface TimeBarProps {
    handleDate: (d: Date) => void;
    anno: number;
    mese: number
}

function useIsClient() {
    return useSyncExternalStore(
        () => () => { },   // subscribe: nessun cambiamento da ascoltare, basta il mount
        () => true,        // snapshot lato client
        () => false         // snapshot lato server
    );
}

function TimeBar({ handleDate, anno, mese }: TimeBarProps) {
    return (
        <div className="flex justify-between items-center p-3 bg-gray-900 text-white rounded border border-gray-800">
            <div className="flex gap-2">
                <button
                    onClick={() => handleDate(new Date(anno, mese - 1, 1))}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded transition text-xs font-semibold"
                >
                    &larr; Prec
                </button>
                <button
                    onClick={() => handleDate(new Date())}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded transition text-xs font-semibold"
                >
                    Oggi
                </button>
                <button
                    onClick={() => handleDate(new Date(anno, mese + 1, 1))}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded transition text-xs font-semibold"
                >
                    Succ &rarr;
                </button>
            </div>
            <div className="text-lg font-bold text-blue-400">{MESI[mese]} {anno}</div>
        </div>
    )
}

export default function ScheduleGrid({ commesse = [], docenti = [], corsi = [], onCellClick }: ScheduleGridProps) {
    const isClient = useIsClient();
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const anno = currentDate.getFullYear();
    const mese = currentDate.getMonth();

    const giorniDelMese = useMemo(() => getDaysInMonth(anno, mese), [anno, mese]);

    if (!isClient) return null;

    return (
        <div className="w-full space-y-4 font-sans">
            {/* BARRA TEMPORALE */}
            <TimeBar handleDate={setCurrentDate} anno={anno} mese={mese} />
            {/* LEGENDA DOCENTI */}
            {docenti && docenti.length > 0 && (
                <div className="p-3 bg-gray-900 rounded border border-gray-800 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 mr-2">Docenti:</span>
                    {docenti.map((doc) => (
                        <div
                            key={doc.codice_fiscale}
                            className="text-xs px-2 py-0.5 rounded font-medium border border-black/30 text-black"
                            style={{ backgroundColor: doc.colore || "#e5e7eb" }}
                        >
                            {doc.nome} {doc.cognome}
                        </div>
                    ))}
                </div>
            )}

            {/* TABELLA EXCEL */}
            <div className="w-full overflow-x-auto border border-black bg-white text-black text-xs">
                <div className="inline-block min-w-full">

                    {/* INTESTAZIONE GIORNI */}
                    <div className="flex border-b-2 border-black sticky top-0 bg-white z-10">

                        {/* SCHEDA SINISTRA INTESTAZIONE (AULA / COMMESSA) */}
                        <div className="w-96 flex-shrink-0 flex border-r-2 border-black font-bold sticky left-0 top-0 z-20 bg-white">
                            <div className="w-24 p-2 bg-yellow-100 border-r border-black flex items-center justify-center text-center">
                                AULA
                            </div>
                            <div className="flex-1 p-2 bg-blue-900 text-white flex items-center justify-center text-sm">
                                COMMESSA / CORSO
                            </div>
                        </div>

                        {/* GIORNI DEL MESE */}
                        <div className="flex">
                            {giorniDelMese.map((giorno) => {
                                const isWeekend = giorno.getDay() === 0 || giorno.getDay() === 6;
                                const dateIso = giorno.toISOString();
                                return (
                                    <div key={dateIso} className={`w-28 flex-shrink-0 border-r border-black text-center ${isWeekend ? "bg-gray-300" : "bg-yellow-100"}`}>
                                        <div className="font-bold border-b border-black py-0.5">
                                            {GIORNI_SETTIMANA[giorno.getDay()]}
                                        </div>
                                        <div className="py-0.5 font-semibold">
                                            {String(giorno.getDate()).padStart(2, '0')}-{MESI[mese].substring(0, 3).toLowerCase()}-{String(anno).slice(-2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* BLOCCO COMMESSA */}
                    {commesse.map((commessa) => {
                        console.log("Corsi" + corsi.length);
                        // Cerca il corso associato verificando le varie proprietà id possibili
                        const corso = corsi?.find(
                            (c) => c.id === commessa.id || c.id === commessa.id || c.id === commessa.id
                        );

                        // Recupero Nome e Cliente
                        const titoloCorso = corso?.nome || commessa.nomeCorso || `Corso #${commessa.id}`;
                        const cliente = corso?.cliente ? `[${corso.cliente}]` : "";
                        const oreTotali = corso?.n_ore ?? commessa.totaleOre ?? 0;

                        // Composizione Orari
                        const orarioFormatted = corso
                            ? `${corso.mattina_inizio}-${corso.mattina_fine} / ${corso.pomeriggio_inizio}-${corso.pomeriggio_fine}`
                            : "09:00-13:00 / 14:00-18:00";

                        return (
                            <div key={commessa.id} className="flex border-b-2 border-black">

                                {/* SCHEDA SINISTRA */}
                                <div className="w-96 flex-shrink-0 flex border-r-2 border-black bg-white sticky left-0 z-10">
                                    <div className="w-24 p-2 bg-amber-200 border-r border-black flex items-center justify-center font-bold text-center">
                                        {commessa.aula}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between p-1.5">
                                        {/* NOME CORSO & CLIENTE */}
                                        <div className="font-bold text-xs uppercase text-blue-900 border-b border-gray-300 pb-1 mb-1 truncate" title={`${titoloCorso} ${cliente}`}>
                                            {titoloCorso} <span className="text-gray-500 font-normal">{cliente}</span>
                                        </div>

                                        {/* Docenti */}
                                        <div className="space-y-0.5">
                                            {commessa.docenti?.map((docentiCommessa, dIdx) => {
                                                const docente = docenti.find(d => d.codice_fiscale === docentiCommessa.cf);

                                                return (
                                                    <div
                                                        key={dIdx}
                                                        className="px-2 py-0.5 font-bold text-center uppercase border border-black/20 rounded-sm"
                                                        style={{ backgroundColor: docente?.colore || "#f3f4f6" }}
                                                    >
                                                        {docente ? `${docente.nome} ${docente.cognome}` : docentiCommessa.nome}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* ORARIO E ORE TOTALI */}
                                        <div className="border-t border-black mt-1 pt-1 flex justify-between font-bold text-[10px]">
                                            <span className="truncate pr-1" title={orarioFormatted}>ORARIO: {orarioFormatted}</span>
                                            <span className="flex-shrink-0">TOT: {oreTotali}h</span>
                                        </div>
                                    </div>
                                </div>

                                {/* GRIGLIA GIORNI */}
                                <div className="flex">
                                    {giorniDelMese.map((giorno) => {
                                        return <DayCell key={giorno.getDate()} giorno={giorno} commessa={commessa} onClick={onCellClick} />
                                    })}
                                </div>

                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}