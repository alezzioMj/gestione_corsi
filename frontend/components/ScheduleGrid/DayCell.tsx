import Box from "@mui/material/Box";
import { CalendarRow } from "./types";

export type renderObject = "SESSIONI" | "RISORSE";

interface DayCellProps {
    giorno: Date;
    row: CalendarRow;
    onClick: (dateKey: string, rowId?: CalendarRow["id"]) => void;
}

export default function DayCell({ giorno, row, onClick}: DayCellProps) {
    const year = giorno.getFullYear();
    const month = String(giorno.getMonth() + 1).padStart(2, "0");
    const day = String(giorno.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    const giornoData = row?.days[dateKey];
    const isWeekend = giorno.getDay() === 0 || giorno.getDay() === 6;

    return (
        <Box onClick={() => onClick(dateKey, row.id)}
            key={dateKey}
            className={`w-28 flex-shrink-0 border-r border-black flex flex-col justify-center ${isWeekend ? "bg-gray-300" : ""}`}>

            {/* MATTINA */}
            <Box className="flex h-6 border-b border-gray-400">
                {[0, 1, 2, 3].map((slotIdx) => {
                    const slot = giornoData?.mattina[slotIdx];
                    return (
                        <Box
                            key={`m-${slotIdx}`}
                            className="flex-1 border-r last:border-r-0 border-gray-300 flex items-center justify-center font-bold text-black"
                            style={{ backgroundColor: slot?.colore || "transparent" }}
                        >
                            {slot?.iniziale || ""}
                        </Box>
                    );
                })}
            </Box>

            {/* POMERIGGIO */}
            <Box className="flex h-6">
                {[0, 1, 2, 3].map((slotIdx) => {
                    const slot = giornoData?.pomeriggio[slotIdx];
                    return (
                        <Box
                            key={`p-${slotIdx}`}
                            className="flex-1 border-r last:border-r-0 border-gray-300 flex items-center justify-center font-bold text-black"
                            style={{ backgroundColor: slot?.colore || "transparent" }}
                        >
                            {slot?.iniziale || ""}
                        </Box>
                    );
                })}
            </Box>

        </Box>
    );
}