"use client";

import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Box,
    TextField,
    InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import { Docente } from "@shared/validation/types";
import { API_BASE_URL } from "@/lib/config";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";

interface Modulo {
    id: number;
    titolo: string;
}

interface ModuloDocente {
    modulo_id: number;
    docente_cf: string;
}

interface AddModuloModalProps {
    docente: Docente;
}

export default function AddModuloModal({ docente }: AddModuloModalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false); // stato separato per il salvataggio

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearchQuery("");
  };

  const { data: moduli = [], isLoading: loadingModuli } = useSWR<Modulo[]>(
    open ? `${API_BASE_URL}/moduli` : null,
    fetcher
  );

  const { data: associazioni, isLoading: loadingAssociazioni } = useSWR(
    open ? `${API_BASE_URL}/docenti/${docente.codice_fiscale}/moduli` : null,
    fetcher
  );

  const loading = loadingModuli || loadingAssociazioni;

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>Associa Moduli</Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Associa Moduli a {docente.nome} {docente.cognome}</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ModuliChecklist
              key={docente.codice_fiscale} // reset se cambia docente
              moduli={moduli}
              initialSelectedIds={estraiModuliIds(associazioni)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              docente={docente}
              onClose={handleClose}
              saving={saving}
              setSaving={setSaving}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ModuliChecklist({
  moduli, initialSelectedIds, searchQuery, onSearchChange, docente, onClose, saving, setSaving,
}: {
  moduli: Modulo[];
  initialSelectedIds: number[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  docente: Docente;
  onClose: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds); // ora è stato vero, editabile
  const router = useRouter();

  const handleToggle = (id: number) => () => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/docenti/${docente.codice_fiscale}/moduli_bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduli_ids: selectedIds }),
      });

      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        alert("Errore durante il salvataggio delle competenze");
      }
    } catch (error) {
      console.error("Errore:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredModuli = moduli.filter((m) =>
    m.titolo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Box sx={{ mb: 2, mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth size="small" placeholder="Cerca modulo..."
          value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        />
        <Box sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>{selectedIds.length} selezionati</Box>
      </Box>
      <Grid container spacing={1}>
        {filteredModuli.map((modulo) => (
          <Grid size={{ xs: 12, sm: 6 }} key={modulo.id}>
            <FormControlLabel
              control={<Checkbox checked={selectedIds.includes(modulo.id)} onChange={handleToggle(modulo.id)} />}
              label={modulo.titolo}
            />
          </Grid>
        ))}
      </Grid>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Annulla</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={24} /> : "Salva Competenze"}
        </Button>
      </DialogActions>
    </>
  );
}

function estraiModuliIds(data: unknown): number[] {
  if (!data) return [];
  if (Array.isArray(data)) return (data as ModuloDocente[]).map((m) => m.modulo_id);
  if (typeof data === 'object' && data !== null && 'docente_modulo' in data) {
    return ((data as any).docente_modulo as ModuloDocente[])?.map((m) => m.modulo_id) || [];
  }
  return [];
}