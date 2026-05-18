"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  Box
} from "@mui/material";
import { SessioneWithRelations } from "../../validation/types";
import { API_BASE_URL } from "@/lib/config";

interface SessionsTableProps {
  sessions: SessioneWithRelations[];
}

export default function SessionsTable({ sessions }: SessionsTableProps) {
  const [edit, setEdit] = React.useState(false);
  const [localSessions, setLocalSessions] = React.useState<SessioneWithRelations[]>(sessions);
  const [modifiedIds, setModifiedIds] = React.useState<Set<number>>(new Set());

  // Sincronizza lo stato locale se cambiano le props (es. filtri applicati nel server)
  React.useEffect(() => {
    setLocalSessions(sessions);
    setEdit(false);
    setModifiedIds(new Set());
  }, [sessions]);

  const handleFieldChange = (id: number, field: keyof SessioneWithRelations, value: any) => {
    setLocalSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
    setModifiedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleCancel = () => {
    setLocalSessions(sessions);
    setEdit(false);
    setModifiedIds(new Set());
  };

  const handleSave = async () => {
    if (modifiedIds.size === 0) {
      setEdit(false);
      return;
    }

    try {
      const sessionsToUpdate = localSessions.filter(s => modifiedIds.has(s.id));

      const updatePromises = sessionsToUpdate.map(async (s) => {
        const res = await fetch(`${API_BASE_URL}/sessioni/${s.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            corso_id: s.corso_id,
            docente_cf: s.docente_cf,
            sede_id: s.sede_id,
            aula_id: s.aula_id,
            modulo_id: s.modulo_id,
            data: s.data,
            ora_inizio: s.ora_inizio,
            ora_fine: s.ora_fine,
            stato: s.stato,
            note: s.note,
            priorita: s.priorita
          }),
        });

        if (!res.ok) {
          throw new Error(`Errore nel salvataggio della sessione ${s.id}`);
        }
      });

      await Promise.all(updatePromises);
      alert("Modifiche salvate con successo!");
      setEdit(false);
      setModifiedIds(new Set());
      
      // NOTA: Se al termine del salvataggio i campi tornano N/D, controlla 
      // la risposta dell'endpoint PUT del backend: deve includere le relazioni!
    } catch (err) {
      console.error("Errore durante il salvataggio:", err);
      alert("Errore durante il salvataggio delle sessioni.");
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color={edit ? "error" : "primary"} 
          onClick={edit ? handleCancel : () => setEdit(true)}
        >
          {edit ? "Annulla" : "Modifica Sessioni"}
        </Button>
        {edit && (
          <Button variant="contained" color="success" onClick={handleSave}>
            Salva Tutto ({modifiedIds.size})
          </Button>
        )}
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          {/* HEADER */}
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Corso</b></TableCell>
              <TableCell><b>Docente</b></TableCell>
              <TableCell><b>Sede</b></TableCell>
              <TableCell><b>Aula</b></TableCell>
              <TableCell><b>Data</b></TableCell>
              <TableCell><b>Orario</b></TableCell>
              <TableCell><b>Stato</b></TableCell>
              <TableCell><b>Note</b></TableCell>
              <TableCell><b>Modulo</b></TableCell>
            </TableRow>
          </TableHead>

          {/* BODY */}
          <TableBody>
            {localSessions.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.corso?.cliente ?? "N/D"}</TableCell>
                <TableCell>
                  {s.docente ? `${s.docente.nome} ${s.docente.cognome}` : "N/D"}
                </TableCell>
                <TableCell>{s.sede?.nome ?? "N/D"}</TableCell>
                <TableCell>{s.aula?.nome ?? "N/D"}</TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      type="date"
                      size="small"
                      value={s.data ? s.data.toString().split('T')[0] : ""}
                      onChange={(e) => handleFieldChange(s.id, "data", e.target.value)}
                    />
                  ) : (
                    s.data ? new Date(s.data).toLocaleDateString("it-IT") : "-"
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        value={s.ora_inizio ?? ""}
                        onChange={(e) => handleFieldChange(s.id, "ora_inizio", e.target.value)}
                        sx={{ width: 80 }}
                      />
                      <TextField
                        size="small"
                        value={s.ora_fine ?? ""}
                        onChange={(e) => handleFieldChange(s.id, "ora_fine", e.target.value)}
                        sx={{ width: 80 }}
                      />
                    </Box>
                  ) : (
                    `${s.ora_inizio ?? "-"} - ${s.ora_fine ?? "-"}`
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <Select
                      size="small"
                      value={s.stato ?? "Bozza"}
                      onChange={(e) => handleFieldChange(s.id, "stato", e.target.value)}
                    >
                      <MenuItem value="Bozza">Bozza</MenuItem>
                      <MenuItem value="Confermata">Confermata</MenuItem>
                    </Select>
                  ) : (
                    <Chip
                      label={s.stato ?? "Bozza"}
                      color={s.stato === "Bozza" ? "warning" : "success"}
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      size="small"
                      value={s.note ?? ""}
                      onChange={(e) => handleFieldChange(s.id, "note", e.target.value)}
                    />
                  ) : (
                    s.note ?? "-"
                  )}
                </TableCell>
                <TableCell>{s.modulo_id ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}