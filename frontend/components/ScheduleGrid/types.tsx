
export interface SlotView {
  colore?: string;
  iniziale?: string;
  tooltip?: string;
}

export interface DayView {
  mattina: SlotView[];
  pomeriggio: SlotView[];
}

export interface CalendarRow {
  id: string | number;
  header: React.ReactNode;           // colonna sinistra, la decide l'adapter
  days: Record<string, DayView>;     // chiave "YYYY-MM-DD"
}