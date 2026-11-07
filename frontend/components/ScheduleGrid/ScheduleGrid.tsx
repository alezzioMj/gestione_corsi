"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import DayCell from "./DayCell";
import { CalendarRow } from "./types";
import { toDateKey } from "./utils";

const MESI = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];
const GIORNI_SETTIMANA = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

const LEFT_WIDTH = 384; 
const DAY_WIDTH = 112;  

const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

function useIsClient() {
    return useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );
}

interface TimeBarProps {
    handleDate: (d: Date) => void;
    anno: number;
    mese: number;
}

function TimeBar({ handleDate, anno, mese }: TimeBarProps) {
    const navSx = { bgcolor: "#1f2937", "&:hover": { bgcolor: "#374151" }, fontWeight: 600 };

    return (
        <Stack
            direction="row"
            sx={{
                justifyContent: "space-between", alignItems: "center", p: 1.5, bgcolor: "#111827", color: "white", borderRadius: 1, border: "1px solid #1f2937"
            }}
        >
            <Stack direction="row" spacing={1}>
                <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    startIcon={<ChevronLeftIcon />}
                    onClick={() => handleDate(new Date(anno, mese - 1, 1))}
                    sx={{ ...navSx, color: "white" }}
                >
                    Prec
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleDate(new Date())}
                    sx={{ fontWeight: 600 }}
                >
                    Oggi
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    endIcon={<ChevronRightIcon />}
                    onClick={() => handleDate(new Date(anno, mese + 1, 1))}
                    sx={{ ...navSx, color: "white" }}
                >
                    Succ
                </Button>
            </Stack>

            <Typography variant="h6" sx={{ fontWeight: 700, color: "#60a5fa" }}>
                {MESI[mese]} {anno}
            </Typography>
        </Stack>
    );
}

interface ScheduleGridProps {
    rows: CalendarRow[];
    legend?: React.ReactNode;
    /** Intestazione della colonna sinistra, dipende dalla vista */
    headerLeft?: React.ReactNode;
    onCellClick: (dateKey: string, rowId?: CalendarRow["id"]) => void;
}

export default function ScheduleGrid({ rows, legend, headerLeft, onCellClick }: ScheduleGridProps) {
    const isClient = useIsClient();
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const anno = currentDate.getFullYear();
    const mese = currentDate.getMonth();

    const giorniDelMese = useMemo(() => getDaysInMonth(anno, mese), [anno, mese]);

    if (!isClient) return null;

    return (
        <Stack spacing={2} sx={{ width: "100%" }}>
            <TimeBar handleDate={setCurrentDate} anno={anno} mese={mese} />

            {legend && (
                <Stack
                    direction="row"
                    useFlexGap
                    spacing={1}
                    sx={{
                        flexWrap: "wrap",
                        alignItems: "center",
                        p: 1.5,
                        bgcolor: "#111827",
                        borderRadius: 1,
                        border: "1px solid #1f2937"
                    }}
                >
                    {legend}
                </Stack>
            )}

            {/* TABELLA */}
            <Box
                sx={{
                    width: "100%",
                    overflowX: "auto",
                    border: "1px solid black",
                    bgcolor: "white",
                    color: "black",
                    fontSize: 12,
                }}
            >
                <Box sx={{ display: "inline-block", minWidth: "100%" }}>
                    {/* INTESTAZIONE GIORNI */}
                    <Box
                        sx={{
                            display: "flex",
                            borderBottom: "2px solid black",
                            position: "sticky",
                            top: 0,
                            bgcolor: "white",
                            zIndex: 10,
                        }}
                    >
                        <Box
                            sx={{
                                width: LEFT_WIDTH,
                                flexShrink: 0,
                                display: "flex",
                                borderRight: "2px solid black",
                                fontWeight: 700,
                                position: "sticky",
                                left: 0,
                                top: 0,
                                zIndex: 20,
                                bgcolor: "white",
                            }}
                        >
                            {headerLeft ?? (
                                <>
                                    <Box
                                        sx={{
                                            width: 96,
                                            p: 1,
                                            bgcolor: "#fef9c3",
                                            borderRight: "1px solid black",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            textAlign: "center",
                                        }}
                                    >
                                        AULA
                                    </Box>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            p: 1,
                                            bgcolor: "#1e3a8a",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 14,
                                        }}
                                    >
                                        COMMESSA / CORSO
                                    </Box>
                                </>
                            )}
                        </Box>

                        <Box sx={{ display: "flex" }}>
                            {giorniDelMese.map((giorno) => {
                                const isWeekend = giorno.getDay() === 0 || giorno.getDay() === 6;
                                return (
                                    <Box
                                        key={toDateKey(giorno)}
                                        sx={{
                                            width: DAY_WIDTH,
                                            flexShrink: 0,
                                            borderRight: "1px solid black",
                                            textAlign: "center",
                                            bgcolor: isWeekend ? "grey.300" : "#fef9c3",
                                        }}
                                    >
                                        <Box sx={{ fontWeight: 700, borderBottom: "1px solid black", py: 0.25 }}>
                                            {GIORNI_SETTIMANA[giorno.getDay()]}
                                        </Box>
                                        <Box sx={{ fontWeight: 600, py: 0.25 }}>
                                            {String(giorno.getDate()).padStart(2, "0")}-
                                            {MESI[mese].substring(0, 3).toLowerCase()}-{String(anno).slice(-2)}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* RIGHE */}
                    {rows.map((row) => (
                        <Box key={row.id} sx={{ display: "flex", borderBottom: "2px solid black" }}>
                            <Box
                                sx={{
                                    width: LEFT_WIDTH,
                                    flexShrink: 0,
                                    display: "flex",
                                    borderRight: "2px solid black",
                                    bgcolor: "white",
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 10,
                                }}
                            >
                                {row.header}
                            </Box>

                            <Box sx={{ display: "flex" }}>
                                {giorniDelMese.map((giorno) => (
                                    <DayCell key={giorno.getDate()} giorno={giorno} row={row} onClick={onCellClick} />
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Stack>
    );
}