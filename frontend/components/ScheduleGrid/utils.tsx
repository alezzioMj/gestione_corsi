import { Box, Typography } from "@mui/material";
import { Docente, Indisponibilita } from "@progetto/shared/validation/types";
import { CalendarRow, DayView, SlotView } from "./types";

// ---------- helper condivisi ----------

const FASCE = {
  mattina:    { da: "09:00", a: "13:00" },
  pomeriggio: { da: "14:00", a: "18:00" },
};

export const toDateKey = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

// "HH:mm" si confronta correttamente come stringa
const overlaps = (aIni: string, aFine: string, bIni: string, bFine: string) =>
  aIni < bFine && aFine > bIni;

function expandIndisponibilita(
  indisp: Indisponibilita,
  slot: SlotView,
  into: Record<string, DayView>
) {
  const inizio = new Date(indisp.data_inizio); // da JSON arriva come stringa
  const fine = new Date(indisp.data_fine);
  const keyInizio = toDateKey(inizio);
  const keyFine = toDateKey(fine);
  const slots = Array.from({ length: 4 }, () => slot);

  const cur = new Date(Date.UTC(inizio.getUTCFullYear(), inizio.getUTCMonth(), inizio.getUTCDate()));
  const last = Date.UTC(fine.getUTCFullYear(), fine.getUTCMonth(), fine.getUTCDate());

  while (cur.getTime() <= last) {
    const key = toDateKey(cur);
    let da = key === keyInizio ? indisp.ora_inizio : "00:00";
    let a = key === keyFine ? indisp.ora_fine : "23:59";
    if (da >= a) { da = "00:00"; a = "23:59"; } // intervallo vuoto (es. 12:00-12:00) = giornata intera

    const day = (into[key] ??= { mattina: [], pomeriggio: [] });
    if (overlaps(da, a, FASCE.mattina.da, FASCE.mattina.a)) day.mattina = slots;
    if (overlaps(da, a, FASCE.pomeriggio.da, FASCE.pomeriggio.a)) day.pomeriggio = slots;

    cur.setUTCDate(cur.getUTCDate() + 1);
  }
}

const tooltipOf = (i: Indisponibilita) =>
  [i.causale, i.descrizione].filter(Boolean).join(" - ");

export const makeHeader = (titolo: string, sottotitolo?: string) => (
  <Box sx={{ flex: 1, p: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
    <Typography variant="body2" noWrap title={titolo} sx={{ fontWeight: 700 }}>
      {titolo}
    </Typography>
    {sottotitolo && (
      <Typography variant="caption" color="text.secondary" noWrap>
        {sottotitolo}
      </Typography>
    )}
  </Box>
);

export function buildRows<E>(
  entities: E[],
  indisp: Indisponibilita[],
  opts: {
    id: (e: E) => string | number;
    header: (e: E) => React.ReactNode;
    match: (i: Indisponibilita, e: E) => boolean;
    colore: (e: E) => string;
  }
): CalendarRow[] {
  return entities.map((e) => {
    const days: Record<string, DayView> = {};
    for (const i of indisp) {
      if (!opts.match(i, e)) continue;
      expandIndisponibilita(i, { colore: opts.colore(e), iniziale: "X", tooltip: tooltipOf(i) }, days);
    }
    return { id: opts.id(e), header: opts.header(e), days };
  });
}