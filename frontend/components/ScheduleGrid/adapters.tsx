import { Aula, Corso, Docente, Indisponibilita, Sede, SessioneWithRelations } from "@progetto/shared/validation/types";
import { CalendarRow, DayView, SlotView } from "./types";
import { Box, Typography } from "@mui/material";
import React from "react";
import { buildRows, makeHeader, toDateKey } from "./utils";


export function sessioniToRows(
  corsi: Corso[],
  sessioni: SessioneWithRelations[]
): CalendarRow[] {
  return corsi.map((c) => {
    const days: Record<string, DayView> = {};

    for (const s of sessioni) {
      if (s.corso_id !== c.id || !s.data) continue;

      const slot: SlotView = {
        colore: s.docente?.colore ?? "#9ca3af",
        iniziale: s.docente?.nome[0] ?? "?",
      };
      const slots = Array.from({ length: 4 }, () => slot);

      const day = (days[toDateKey(new Date(s.data))] ??= {
        mattina: [],
        pomeriggio: [],
      });

      if (s.ora_inizio < c.mattina_fine) day.mattina = slots;
      else day.pomeriggio = slots;
    }

    const header = (
      <Box sx={{ flex: 1, p: 1, display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>Commessa:</Typography>
        <Typography variant="body2" noWrap title={c.nome}>{c.nome}</Typography>
      </Box>
    );

    return { id: c.id, header, days };
  });
}

const COLORE_INDISP = "#f87171";

export function indisponibilitaDocentiToRows(docenti: Docente[], indisp: Indisponibilita[]): CalendarRow[] {
  return buildRows(docenti, indisp, {
    id: (d) => d.codice_fiscale,
    header: (d) => makeHeader(`${d.nome} ${d.cognome}`),
    match: (i, d) => i.docente_cf === d.codice_fiscale,
    colore: (d) => d.colore || COLORE_INDISP,
  });
}

export function indisponibilitaAuleToRows(aule: Aula[], indisp: Indisponibilita[]): CalendarRow[] {
  return buildRows(aule, indisp, {
    id: (a) => a.id,
    header: (a) => makeHeader(a.nome),
    match: (i, a) => i.aula_id === a.id,
    colore: () => COLORE_INDISP,
  });
}

export function indisponibilitaSediToRows(sedi: Sede[], indisp: Indisponibilita[]): CalendarRow[] {
  return buildRows(sedi, indisp, {
    id: (s) => s.id,
    header: (s) => makeHeader(s.nome),
    match: (i, s) => i.sede_id === s.id,
    colore: () => COLORE_INDISP,
  });
}