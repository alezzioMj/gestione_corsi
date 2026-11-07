import { Corso, SessioneWithRelations } from "@progetto/shared/validation/types";
import { CalendarRow, DayView, SlotView } from "./types";
import { Box, Typography } from "@mui/material";
import React from "react";
import { toDateKey } from "./utils";


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
//export function indisponibilitaDocentiToRows(docenti, indisp): CalendarRow[] {  }
//export function indisponibilitaAuleToRows(aule, indisp): CalendarRow[] {  }
//export function indisponibilitaSediToRows(sedi, indisp): CalendarRow[] {  }