"use client";

import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Autocomplete, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import EditIcon from "@mui/icons-material/Edit";
import * as countries from "i18n-iso-countries";
import itLocale from "i18n-iso-countries/langs/it.json";

import { Docente } from "@progetto/shared/validation/types";
import { DOCENTE_COLORS } from "@progetto/shared/constants/docente";

import ColorSwatchPicker from "@/components/Docenti/ColorSwatchPicker";
import { API_BASE_URL } from "@/lib/config";

type Provincia = {
    id: number;
    codice: string;
    nome: string;
};

type Comune = {
    nome: string;
    codice: string;
    provincia: string;
    regione: string;
};

interface EditDocenteModalProps {
    open: boolean;
    onClose: () => void;
    docente: Docente | null;
    onSaveSuccess: () => void;
}

countries.registerLocale(itLocale);

export default function EditDocenteModal({ open, onClose, docente, onSaveSuccess }: EditDocenteModalProps) {
    const [loading, setLoading] = useState(false);
    const [coloreError, setColoreError] = useState(false);

    const [formData, setFormData] = useState({
        colore: docente?.colore || DOCENTE_COLORS[0],
        nome: docente?.nome || "",
        cognome: docente?.cognome || "",
        codice_fiscale: docente?.codice_fiscale || "",
        datanascita: docente?.datanascita ? new Date(docente?.datanascita).toISOString().split('T')[0] : "",
        nazione: docente?.nazione || "Italia",
        regione: docente?.regione || "",
        provincia: docente?.provincia || "",
        comune: docente?.comune || "",
        sesso: docente?.sesso || "",
        cellulare: docente?.cellulare || "",
        mail: docente?.mail || "",
        cv: docente?.cv || "",
        contratto: docente?.contratto || "",
    });

    const [regioni, setRegioni] = useState<string[]>([]);
    const [province, setProvince] = useState<Provincia[]>([]);
    const [comuni, setComuni] = useState<Comune[]>([]);

    const countryOptions = Object.entries(countries.getNames("it")).map(([code, name]) => ({
        code,
        name
    }));

    useEffect(() => {
        if (!open || !docente) return;

        const isItaly = formData.nazione === "Italia" || formData.nazione === "IT";

        const fetchInitialGeoData = async () => {
            if (isItaly) {
                try {
                    const resRegioni = await fetch("https://comuni-ita.nicolorebaioli.dev/regioni");
                    const dataRegioni = await resRegioni.json();
                    setRegioni(dataRegioni);

                    if (formData.regione) {
                        const resProvince = await fetch(`https://comuni-ita.nicolorebaioli.dev/province?regione=${encodeURIComponent(formData.regione)}`);
                        const dataProvince = await resProvince.json();
                        setProvince(dataProvince);

                        if (formData.provincia) {
                            const resComuni = await fetch(`https://comuni-ita.nicolorebaioli.dev/comuni?provincia=${encodeURIComponent(formData.provincia)}`);
                            const dataComuni = await resComuni.json();
                            setComuni(dataComuni);
                        }
                    }
                } catch (err) {
                    console.error("Errore caricamento dati geografici iniziali", err);
                }
            } else {
                setRegioni([]);
                setProvince([]);
                setComuni([]);
            }
        };

        fetchInitialGeoData();
    }, [open, docente, formData.nazione, formData.regione, formData.provincia]);

    const handleClose = () => {
        onClose();
        setProvince([]);
        setComuni([]);
    };

    const handleRegioneChange = async (newRegione: string | null) => {
        setFormData(prev => ({ ...prev, regione: newRegione || "", provincia: "", comune: "" }));
        setProvince([]);
        setComuni([]);
        if (newRegione) {
            try {
                const res = await fetch(`https://comuni-ita.nicolorebaioli.dev/province?regione=${encodeURIComponent(newRegione)}`);
                const data = await res.json();
                setProvince(data);
            } catch (err) {
                console.error("Errore caricamento province", err);
            }
        }
    };

    const handleProvinciaChange = async (newProvincia: string | null) => {
        setFormData(prev => ({ ...prev, provincia: newProvincia || "", comune: "" }));
        setComuni([]);
        if (newProvincia) {
            try {
                const res = await fetch(`https://comuni-ita.nicolorebaioli.dev/comuni?provincia=${encodeURIComponent(newProvincia)}`);
                const data = await res.json();
                setComuni(data);
            } catch (err) {
                console.error("Errore caricamento comuni", err);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.colore) {
            setColoreError(true);
            return;
        }
        setColoreError(false);
        setLoading(true);

        try {
            if (!docente?.codice_fiscale) {
                alert("Errore: Codice fiscale del docente non disponibile per l'aggiornamento.");
                setLoading(false);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/docenti/${docente.codice_fiscale}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSaveSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                alert(`Errore: ${errorData.error || "Impossibile aggiornare il docente"}`);
            }
        } catch (error) {
            console.error("Errore:", error);
            alert("Errore di rete.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <form onSubmit={handleSubmit}>
                <DialogTitle>Modifica Docente</DialogTitle>
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
                                    handleRegioneChange(null);
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                                options={regioni}
                                value={regioni.find(r => r === formData.regione) || null}
                                getOptionLabel={(opt) => opt || ""}
                                isOptionEqualToValue={(option, value) => option === value}
                                renderInput={(params) => <TextField {...params} label="Regione" required={formData.nazione === "Italia"} />}
                                disabled={formData.nazione !== "Italia"}
                                onChange={(_, val) => {
                                    handleRegioneChange(val);
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                                options={province}
                                value={province.find(p => p.nome === formData.provincia) || null}
                                getOptionLabel={(opt) => opt.nome || ""}
                                isOptionEqualToValue={(option, value) => option.nome === value.nome}
                                renderInput={(params) => <TextField {...params} label="Provincia" required={formData.nazione === "Italia"} />}
                                disabled={!formData.regione || formData.nazione !== "Italia"}
                                onChange={(_, val) => handleProvinciaChange(val?.nome || "")}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                                options={comuni}
                                value={comuni.find(c => c.nome === formData.comune) || null}
                                getOptionLabel={(opt) => opt.nome || ""}
                                isOptionEqualToValue={(option, value) => option.nome === value.nome}
                                renderInput={(params) => <TextField {...params} label="Comune" required={formData.nazione === "Italia"} />}
                                disabled={!formData.provincia || formData.nazione !== "Italia"}
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
                    <Button type="submit" variant="contained" startIcon={<EditIcon />} disabled={loading}>
                        {loading ? "Salvataggio..." : "Salva Modifiche"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}