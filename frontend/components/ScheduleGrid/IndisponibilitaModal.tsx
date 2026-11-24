"use client";

import { useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventBusyIcon from "@mui/icons-material/EventBusy";

import { Indisponibilita } from "@progetto/shared/validation/indisponibilita.schema";
import { toDateKey } from "./utils";

// Il tipo condiviso potrebbe non avere l'id: serve per eliminare
export type IndisponibilitaConId = Indisponibilita & { id: number };

interface IndisponibilitaModalProps {
  open: boolean;
  onClose: () => void;
  /** Giorno cliccato, formato "YYYY-MM-DD" (lo stesso di onCellClick) */
  dateKey: string;
  /** Nome della riga cliccata (docente, aula o sede) */
  titolo?: string;
  /** Indisponibilità della riga cliccata: il filtro per giorno lo fa il modale */
  indisponibilita: IndisponibilitaConId[];
  onDelete: (indisponibilitaId: number) => void;
}

const formatData = (value: string | Date) =>
  new Date(value).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

export default function IndisponibilitaModal({
  open,
  onClose,
  dateKey,
  titolo,
  indisponibilita,
  onDelete,
}: IndisponibilitaModalProps) {
  // Stessa logica con cui la griglia disegna le indisponibilità:
  // il giorno è coperto se cade tra data_inizio e data_fine (in UTC)
  const delGiorno = useMemo(() => {
    return indisponibilita
      .filter((i) => {
        const keyInizio = toDateKey(new Date(i.data_inizio));
        const keyFine = toDateKey(new Date(i.data_fine));
        return keyInizio <= dateKey && dateKey <= keyFine;
      })
      .sort((a, b) => a.ora_inizio.localeCompare(b.ora_inizio));
  }, [indisponibilita, dateKey]);

  const dataFormattata = new Date(`${dateKey}T00:00:00`).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <CalendarTodayIcon color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, textTransform: "capitalize", lineHeight: 1.2 }}>
              {dataFormattata}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {titolo && `${titolo} - `}
              {delGiorno.length === 1 ? "1 indisponibilità" : `${delGiorno.length} indisponibilità`}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {delGiorno.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              py: 6,
              px: 2,
            }}
          >
            <EventBusyIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1.5 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.secondary" }}>
              Nessuna indisponibilità
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Non ci sono indisponibilità registrate per questo giorno.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
            {delGiorno.map((indisp) => (
              <Box
                key={indisp.id}
                sx={{
                  display: "flex",
                  gap: 2,
                  px: 2.5,
                  py: 2,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {/* Periodo */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 110,
                    borderRight: "2px solid",
                    borderColor: "error.main",
                    pr: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {formatData(indisp.data_inizio)} {indisp.ora_inizio}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    ↓
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {formatData(indisp.data_fine)} {indisp.ora_fine}
                  </Typography>
                </Box>

                {/* Dettagli */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                    {indisp.causale || "Indisponibilità"}
                  </Typography>
                  {indisp.descrizione && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {indisp.descrizione}
                    </Typography>
                  )}

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(indisp.id)}
                    sx={{ mt: 0.5 }}
                  >
                    Elimina
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
}