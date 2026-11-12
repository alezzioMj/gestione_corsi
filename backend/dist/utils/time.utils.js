"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHoursToTime = exports.calculateHours = exports.hasOverlap = exports.toMinutes = void 0;
const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};
exports.toMinutes = toMinutes;
const hasOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;
exports.hasOverlap = hasOverlap;
const calculateHours = (start, end) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    // Calcola il tempo in minuti da mezzanotte
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    // Restituisci le ore come numero decimale
    return (endTotalMinutes - startTotalMinutes) / 60;
};
exports.calculateHours = calculateHours;
const addHoursToTime = (start, durataOre) => {
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
exports.addHoursToTime = addHoursToTime;
