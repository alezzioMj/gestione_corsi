"use client";

import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Autocomplete, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import * as countries from "i18n-iso-countries";
import itLocale from "i18n-iso-countries/langs/it.json";
import { Docente } from "../../validation/types";
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

// Registra la localizzazione italiana per la libreria delle nazioni
countries.registerLocale(itLocale);

export default function EditDocenteModal({ open, onClose, docente, onSaveSuccess }: EditDocenteModalProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        nome: "",
        cognome: "",
        codice_fiscale: "",
        datanascita: "",
        nazione: "Italia", // Default Italia
        regione: "",
        provincia: "",
        comune: "",
        sesso: "",
        cellulare: "",
        mail: "",
        cv: "",
        contratto: "",
    });
    
    useEffect(() => {
        if (docente) {
            setFormData({
                nome: docente.nome || "",
                cognome: docente.cognome || "",
                codice_fiscale: docente.codice_fiscale || "",
                datanascita: docente.datanascita ? new Date(docente.datanascita).toISOString().split('T')[0] : "",
                nazione: docente.nazione || "Italia",
                regione: docente.regione || "",
                provincia: docente.provincia || "",
                comune: docente.comune || "",
                sesso: docente.sesso || "",
                cellulare: docente.cellulare || "",
                mail: docente.mail || "",
                cv: docente.cv || "",
                contratto: docente.contratto || "",
            });
        } else {
            // Reset form if no docente is provided (e.g., modal closed and reopened for a new one, though this is an edit modal)
            setFormData({ nome: "", cognome: "", codice_fiscale: "", datanascita: "", nazione: "Italia", regione: "", provincia: "", comune: "", sesso: "", cellulare: "", mail: "", cv: "", contratto: "" });
        }
    }, [docente]);

    // Stati per le opzioni geografiche
    const [regioni, setRegioni] = useState<string[]>([]);
    const [province, setProvince] = useState<Provincia[]>([]);
    const [comuni, setComuni] = useState<Comune[]>([]);

    // Ottieni la lista delle nazioni in italiano dalla libreria
    const countryOptions = Object.entries(countries.getNames("it")).map(([code, name]) => ({
        code,
        name
    }));

    // This useEffect handles initial loading of geographical data when the modal opens
    // or when the docente prop changes.
    useEffect(() => {
        if (!open || !docente) {
            // Reset state when modal is closed or no docente is provided
            setRegioni([]);
            setProvince([]);
            setComuni([]);
            return;
        }

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
        // Reset form data is handled by the useEffect when docente becomes null or open becomes false
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
        setLoading(true);

        try {
            if (!docente?.codice_fiscale) {
                alert("Errore: Codice fiscale del docente non disponibile per l'aggiornamento.");
                setLoading(false);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/docenti/${docente.codice_fiscale}`, {
                method: "PUT", // Changed to PUT
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSaveSuccess(); // Call the success callback
                onClose(); // Close the modal
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

    // Calcolo codice fiscale
    /*const calculateCodiceFiscale = (
        nome: string,
        cognome: string,
        sesso: string,
        luogoDiNascita: string,
        codiceProvincia: string,
        giornoDiNascita: string,
        meseDiNascita: string,
        annoDiNascita: string,
        livelloOmocodia: string,
        comuneSospeso: string,
        access_token: string
    ) => async () => {
        const URL = "http://api.miocodicefiscale.it/calculate?lname={cognome}&fname={nome}&gender={sesso}&city={luogo-di-nascita}&state={codice-provincia}&abolished={comune-soppresso}&day={giorno-di-nascita}&month={mese-di-nascita}&year={anno-di-nascita}&omocodia_level={livello-omocodia}&access_token={tua-chiave-API}";
        try {
            const res = await fetch(URL)
        } catch {

        }
    }*/

    return (
        <>            
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Modifica Docente</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {/* Dati Anagrafici */}
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

                            {/* Contatti */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Email" type="email" fullWidth required value={formData.mail}
                                    onChange={(e) => setFormData({ ...formData, mail: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Cellulare" fullWidth value={formData.cellulare}
                                    onChange={(e) => setFormData({ ...formData, cellulare: e.target.value })} />
                            </Grid>

                            {/* Geografia */}
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
                                        handleRegioneChange(null); // Clear and reset for new country
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
                                    onChange={(_, val) => setFormData({ ...formData, comune: val?.nome || "", })}
                                />
                            </Grid>

                            {/* Documentazione e Contratto */}
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
        </>
    );
}