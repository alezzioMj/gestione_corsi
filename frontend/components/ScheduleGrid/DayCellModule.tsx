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
  Divider,
} from "@mui/material";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EventBusyIcon from "@mui/icons-material/EventBusy";

import { SessioneWithRelations } from "@/validation/types";

interface DayCellModalProps {
  open: boolean;
  onClose: () => void;
  giorno: Date;
  commesse: SessioneWithRelations[];
}

export default function DayCellModal({
  open,
  onClose,
  giorno,
  commesse,
}: DayCellModalProps) {
  // Converte la data selezionata in YYYY-MM-DD
  const dateKey = useMemo(() => {
    const year = giorno.getFullYear();
    const month = String(giorno.getMonth() + 1).padStart(2, "0");
    const day = String(giorno.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, [giorno]);

  /*
   * commesse contiene TUTTE le sessioni di TUTTI i giorni.
   *
   * Qui prendiamo solamente quelle la cui data
   * corrisponde al giorno selezionato.
   */
  const sessioniDelGiorno = useMemo(() => {
    return commesse.filter((commessa) => {
      if (!commessa.data) return false;

      const dataSessione = new Date(commessa.data);

      const anno = dataSessione.getUTCFullYear();
      const mese = String(
        dataSessione.getUTCMonth() + 1
      ).padStart(2, "0");
      const giornoSessione = String(
        dataSessione.getUTCDate()
      ).padStart(2, "0");

      const sessioneDateKey =
        `${anno}-${mese}-${giornoSessione}`;

      return sessioneDateKey === dateKey;
    });
  }, [commesse, dateKey]);

  // Data formattata in italiano
  const dataFormattata = giorno.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <CalendarTodayIcon color="primary" />

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {dataFormattata}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Sessioni programmate
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            mt: 1,
          }}
        >
          {sessioniDelGiorno.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                py: 5,
                px: 2,
              }}
            >
              <EventBusyIcon
                sx={{
                  fontSize: 48,
                  color: "text.disabled",
                  mb: 1.5,
                }}
              />

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                Nessuna sessione programmata
              </Typography>

              <Typography
                variant="caption"
                color="text.disabled"
              >
                Non ci sono corsi o attività assegnate
                per questa data.
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <SchoolIcon color="primary" />

                <Typography
                  variant="subtitle2"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  Attività della giornata
                </Typography>
              </Box>

              {sessioniDelGiorno.map(
                (commessa, index) => {
                  return (
                    <Box
                      key={commessa.id}
                      sx={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: 2,
                      }}
                    >
                      {/* Corso e modulo */}
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <SchoolIcon
                            fontSize="small"
                            color="primary"
                          />

                          {commessa.corso?.azienda ||
                            `Corso #${commessa.corso_id}`}
                        </Typography>

                        {/* Modulo */}
                        {commessa.modulo && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              ml: 3.5,
                            }}
                          >
                            <strong>Modulo:</strong>{" "}
                            {commessa.modulo.nome ||
                              `Modulo #${commessa.modulo_id}`}
                          </Typography>
                        )}

                        {/* Aula */}
                        {commessa.aula && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.7,
                              mt: 0.5,
                            }}
                          >
                            <MeetingRoomIcon
                              sx={{ fontSize: 17 }}
                            />

                            Aula:{" "}
                            <strong>
                              {typeof commessa.aula === "object"
                                ? commessa.aula.nome ||
                                commessa.aula.id
                                : commessa.aula}
                            </strong>
                          </Typography>
                        )}
                      </Box>
                      <Divider />

                      {/* Orario */}
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          sx={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 1,
                            fontWeight: 700,
                            mb: 1,
                          }}
                        >
                          <AccessTimeIcon fontSize="small" />

                          Orario
                        </Typography>

                        <Box
                          sx={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 1,
                            pl: 0.5,
                          }}
                        >
                          <AccessTimeIcon
                            fontSize="small"
                          />

                          <Typography variant="body2">
                            <strong>
                              {commessa.ora_inizio ||
                                "--:--"}
                            </strong>
                            {" - "}
                            <strong>
                              {commessa.ora_fine ||
                                "--:--"}
                            </strong>
                          </Typography>
                        </Box>
                      </Box>

                      {/* Docente */}
                      <Box>
                        <Box
                          sx={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 1,
                          }}
                        >
                          <PersonIcon
                            fontSize="small"
                            color="primary"
                          />

                          <Typography variant="body2">
                            <strong>
                              Docente:
                            </strong>{" "}
                            {commessa.docente
                              ? `${commessa.docente.nome} ${commessa.docente.cognome}`
                              : "Docente non assegnato"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Separatore */}
                      {index <
                        sessioniDelGiorno.length -
                        1 && (
                          <Divider
                            sx={{
                              mt: 0.5,
                            }}
                          />
                        )}
                    </Box>
                  );
                }
              )}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          color="inherit"
        >
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
}