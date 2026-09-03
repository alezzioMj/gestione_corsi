import { RigaCommessa } from "@/lib/formatSessioni";

interface DayCellProps {
    giorno: Date;
    commessa: RigaCommessa;
    onClick: (dateKey: string, commessaId?: number) => void;
}

export default function DayCell({ giorno, commessa, onClick }: DayCellProps) {
    const year = giorno.getFullYear();
    const month = String(giorno.getMonth() + 1).padStart(2, "0");
    const day = String(giorno.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    const giornoData = commessa?.sessioniMap[dateKey];
    const isWeekend = giorno.getDay() === 0 || giorno.getDay() === 6;

    return (
        <div onClick={() => onClick(dateKey, commessa.id)}
            key={dateKey}
            className={`w-28 flex-shrink-0 border-r border-black flex flex-col justify-center ${isWeekend ? "bg-gray-300" : ""}`}>

            {/* MATTINA */}
            <div className="flex h-6 border-b border-gray-400">
                {[0, 1, 2, 3].map((slotIdx) => {
                    const slot = giornoData?.mattina[slotIdx];
                    return (
                        <div
                            key={`m-${slotIdx}`}
                            className="flex-1 border-r last:border-r-0 border-gray-300 flex items-center justify-center font-bold text-black"
                            style={{ backgroundColor: slot?.colore || "transparent" }}
                        >
                            {slot?.iniziale || ""}
                        </div>
                    );
                })}
            </div>

            {/* POMERIGGIO */}
            <div className="flex h-6">
                {[0, 1, 2, 3].map((slotIdx) => {
                    const slot = giornoData?.pomeriggio[slotIdx];
                    return (
                        <div
                            key={`p-${slotIdx}`}
                            className="flex-1 border-r last:border-r-0 border-gray-300 flex items-center justify-center font-bold text-black"
                            style={{ backgroundColor: slot?.colore || "transparent" }}
                        >
                            {slot?.iniziale || ""}
                        </div>
                    );
                })}
            </div>

        </div>
    );
}