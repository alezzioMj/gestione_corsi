"use client";

import React, { useMemo } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
} from "@mui/material";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import { ExtensionOutlined } from "@mui/icons-material";

import { SessioneWithRelations } from "@/validation/types";

interface DayCellModalProps {
  open: boolean;
  onClose: () => void;
  giorno: Date;
  sessioni: SessioneWithRelations[];
}

// Formatta un orario (Date) in stringa "HH:mm", o un fallback se assente
function formatOra(data: Date | string | null | undefined): string {
  if (!data) return "--:--";
  return new Date(data).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DayCellModal({ open, onClose, giorno, sessioni }: DayCellModalProps) {
  const dateKey = useMemo(() => {
    const year = giorno.getFullYear();
    const month = String(giorno.getMonth() + 1).padStart(2, "0");
    const day = String(giorno.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [giorno]);

  const sessioniDelGiorno = useMemo(() => {
    return sessioni
      .filter((sessione) => {
        if (!sessione.data) return false;
        const d = new Date(sessione.data);
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
          d.getUTCDate()
        ).padStart(2, "0")}`;
        return key === dateKey;
      })
      .sort((a, b) => {
        const oraA = a.ora_inizio ? new Date(a.ora_inizio).getTime() : 0;
        const oraB = b.ora_inizio ? new Date(b.ora_inizio).getTime() : 0;
        return oraA - oraB;
      });
  }, [sessioni, dateKey]);

  const dataFormattata = giorno.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <CalendarTodayIcon color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, textTransform: "capitalize", lineHeight: 1.2 }}>
              {dataFormattata}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {sessioniDelGiorno.length === 1
                ? "1 sessione programmata"
                : `${sessioniDelGiorno.length} sessioni programmate`}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {sessioniDelGiorno.length === 0 ? (
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
              Nessuna sessione programmata
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Non ci sono corsi o attività assegnate per questa data.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
            {sessioniDelGiorno.map((sessione) => (
              <Box
                key={sessione.id}
                sx={{
                  display: "flex",
                  gap: 2,
                  px: 2.5,
                  py: 2,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {/* Colonna orario: elemento più caratteristico, in evidenza a sinistra */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 64,
                    borderRight: "2px solid",
                    borderColor: "primary.main",
                    pr: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {sessione.ora_inizio}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    ↓
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {sessione.ora_fine}
                  </Typography>
                </Box>

                {/* Contenuto: corso come titolo, resto come riga di dettagli compatta */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                    {sessione.corso?.nome ?? `Corso #${sessione.corso_id}`}
                  </Typography>
                  {sessione.corso?.cliente && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                      {sessione.corso.cliente}
                    </Typography>
                  )}

                  <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 0.5 }}>
                    {sessione.modulo && (
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <ExtensionOutlined sx={{ fontSize: 16 }} color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {sessione.modulo.titolo || `Modulo #${sessione.modulo_id}`}
                        </Typography>
                      </Stack>
                    )}

                    {sessione.aula && (
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <MeetingRoomIcon sx={{ fontSize: 16 }} color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {typeof sessione.aula === "object"
                            ? sessione.aula.nome || sessione.aula.id
                            : sessione.aula}
                        </Typography>
                      </Stack>
                    )}

                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <PersonIcon sx={{ fontSize: 16 }} color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {sessione.docente
                          ? `${sessione.docente.nome} ${sessione.docente.cognome}`
                          : "Docente non assegnato"}
                      </Typography>
                    </Stack>
                  </Stack>
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