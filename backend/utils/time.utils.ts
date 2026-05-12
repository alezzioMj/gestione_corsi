export const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};

export const hasOverlap = (
    aStart: number,
    aEnd: number,
    bStart: number,
    bEnd: number
) => aStart < bEnd && aEnd > bStart;

export const calculateHours = (start: string, end: string): number => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    // Calcola il tempo in minuti da mezzanotte
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Restituisci le ore come numero decimale
    return (endTotalMinutes - startTotalMinutes) / 60;
};


export const addHoursToTime = (start: string, durataOre: number): string => {
    const [startHour, startMinute] = start.split(":").map(Number);

    // 1. Convertiamo tutto in minuti per gestire facilmente i resti
    const totalStartMinutes = (startHour * 60) + startMinute;
    
    // 2. Trasformiamo la durata (ore) in minuti
    const minutiDaAggiungere = Math.round(durataOre * 60);
    
    const finalTotalMinutes = totalStartMinutes + minutiDaAggiungere;

    // 3. Gestione dell'overflow (se supera le 24 ore)
    const wrappedMinutes = finalTotalMinutes % 1440; 
    
    const hours = Math.floor(wrappedMinutes / 60);
    const minutes = wrappedMinutes % 60;

    // 4. Formattazione HH:mm
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};