"use client";

import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Autocomplete, CircularProgress, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import * as countries from "i18n-iso-countries";
import itLocale from "i18n-iso-countries/langs/it.json";
import { API_BASE_URL } from "@/lib/config";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { DOCENTE_COLORS } from "@/lib/constants/docente";
import ColorSwatchPicker from "@/components/Docenti/ColorSwatchPicker";

type Provincia = { codice: string; nome: string; regione: string; sigla: string };
type Comune = { nome: string };

countries.registerLocale(itLocale);

interface AddDocenteModalProps {
    onDocenteAdded?: () => void;
}

export default function AddDocenteModal({ onDocenteAdded }: AddDocenteModalProps) {
    const [formData, setFormData] = useState({
        colore: DOCENTE_COLORS[0] as string,
        nome: "",
        cognome: "",
        codice_fiscale: "",
        datanascita: "",
        nazione: "Italia",
        regione: "",
        provincia: "",
        comune: "",
        sesso: "",
        cellulare: "",
        mail: "",
        cv: "",
        contratto: "",
    });

    const [coloreError, setColoreError] = useState(false);

    const isItaly = formData.nazione === "Italia" || formData.nazione === "IT";
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { data: regioni = [] } = useSWR(
        open && isItaly ? "https://comuni-ita.nicolorebaioli.dev/regioni" : null,
        fetcher
    );
    const { data: province = [] } = useSWR(
        open && isItaly && formData.regione ? `https://comuni-ita.nicolorebaioli.dev/province?regione=${formData.regione}` : null,
        fetcher
    );
    const { data: comuni = [] } = useSWR(
        open && isItaly && formData.provincia ? `https://comuni-ita.nicolorebaioli.dev/comuni?provincia=${formData.provincia}` : null,
        fetcher
    );

    const countryOptions = Object.entries(countries.getNames("it")).map(([code, name]) => ({
        code,
        name
    }));

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setColoreError(false);
        setFormData({
            colore: DOCENTE_COLORS[0],
            nome: "", cognome: "", codice_fiscale: "", datanascita: "", nazione: "Italia",
            regione: "", provincia: "", comune: "", sesso: "", cellulare: "", mail: "", cv: "", contratto: ""
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.colore) {
            setColoreError(true);
            return;
        }
        setColoreError(false);
        setSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/docenti`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                if (onDocenteAdded) onDocenteAdded();
                handleClose();
            } else {
                const errorData = await res.json();
                alert(`Errore: ${errorData.error || res.statusText}`);
            }
        } catch (error) {
            console.error("Errore:", error);
            alert("Errore di rete.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                AGGIUNGI Nuovo Docente
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Aggiungi Nuovo Docente</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Nome" fullWidth required value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Cognome" fullWidth required value={formData.cognome}
                                    onChange={(e) => setFormData({ ...formData, cognome: e.target.value })} />
                            </Grid>
                            <Grid size={12}>
                                <TextField label="Codice Fiscale" fullWidth required value={formData.codice_fiscale}
                                    onChange={(e) => setFormData({ ...formData, codice_fiscale: e.target.value.toUpperCase() })} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Data di Nascita" type="date" fullWidth required
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={formData.datanascita}
                                    onChange={(e) => setFormData({ ...formData, datanascita: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField select label="Sesso" fullWidth required value={formData.sesso}
                                    onChange={(e) => setFormData({ ...formData, sesso: e.target.value })}>
                                    <MenuItem value="M">Maschio</MenuItem>
                                    <MenuItem value="F">Femmina</MenuItem>
                                    <MenuItem value="Altro">Altro</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Email" type="email" fullWidth required value={formData.mail}
                                    onChange={(e) => setFormData({ ...formData, mail: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Cellulare" fullWidth value={formData.cellulare}
                                    onChange={(e) => setFormData({ ...formData, cellulare: e.target.value })} />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Autocomplete
                                    options={countryOptions}
                                    getOptionLabel={(opt) => opt.name || ""}
                                    value={countryOptions.find(c => c.name === formData.nazione) || null}
                                    renderInput={(params) => <TextField {...params} label="Nazione" required />}
                                    isOptionEqualToValue={(option, value) => option.name === value.name}
                                    onChange={(_, val) => {
                                        const newNazione = val?.name || "";
                                        setFormData({ ...formData, nazione: newNazione, regione: "", provincia: "", comune: "" });
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Autocomplete
                                    key={formData.nazione}
                                    disabled={!isItaly}
                                    options={regioni}
                                    value={formData.regione || null}
                                    onChange={(_, val) => setFormData({ ...formData, regione: val || "", provincia: "", comune: "" })}
                                    renderInput={(params) => <TextField {...params} label="Regione" required={isItaly} />}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Autocomplete
                                    key={formData.regione}
                                    disabled={!isItaly || !formData.regione}
                                    options={province}
                                    getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.nome || "")}
                                    value={province.find((p: Provincia) => p.nome === formData.provincia) || null}
                                    isOptionEqualToValue={(option, value) => option.nome === value.nome}
                                    onChange={(_, val: Provincia | null) => setFormData({ ...formData, provincia: val?.nome || "", comune: "" })}
                                    renderInput={(params) => <TextField {...params} label="Provincia" required={isItaly} />}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Autocomplete
                                    key={formData.provincia}
                                    options={comuni}
                                    value={comuni.find((c: Comune) => c.nome === formData.comune) || null}
                                    getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.nome || "")}
                                    isOptionEqualToValue={(option, value) => option.nome === value.nome}
                                    renderInput={(params) => <TextField {...params} label="Comune" required={isItaly} />}
                                    disabled={!formData.provincia || !isItaly}
                                    onChange={(_, val) => setFormData({ ...formData, comune: val?.nome || "" })}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Contratto"
                                    placeholder="Es: P.IVA, Co.Co.Co"
                                    fullWidth
                                    value={formData.contratto}
                                    onChange={(e) => setFormData({ ...formData, contratto: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Link CV"
                                    placeholder="URL o riferimento CV"
                                    fullWidth
                                    value={formData.cv}
                                    onChange={(e) => setFormData({ ...formData, cv: e.target.value })}
                                />
                            </Grid>

                            <Grid size={12}>
                                <Typography variant="subtitle2" gutterBottom>Colore</Typography>
                                <ColorSwatchPicker
                                    value={formData.colore}
                                    onChange={(color) => {
                                        setFormData({ ...formData, colore: color });
                                        setColoreError(false);
                                    }}
                                />
                                {coloreError && (
                                    <Typography color="error" variant="caption">
                                        Seleziona un colore
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Annulla</Button>
                        <Button type="submit" variant="contained" disabled={submitting}>
                            {submitting ? <CircularProgress size={24} /> : "Salva"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}