"use client";

import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Autocomplete, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import * as countries from "i18n-iso-countries";
import itLocale from "i18n-iso-countries/langs/it.json";
import { API_BASE_URL } from "@/lib/config";

type Provincia = {
    codice: string;
    nome: string;
    regione: string;
    sigla: string;
};

type Comune = {
    nome: string;
};


// Registra la localizzazione italiana per la libreria delle nazioni
countries.registerLocale(itLocale);

export default function AddDocenteModal() {
    const [open, setOpen] = useState(false);
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

    // Stati per le opzioni geografiche
    const [regioni, setRegioni] = useState<string[]>([]);
    const [province, setProvince] = useState<Provincia[]>([]);
    const [comuni, setComuni] = useState<Comune[]>([]);

    // Ottieni la lista delle nazioni in italiano dalla libreria
    const countryOptions = Object.entries(countries.getNames("it")).map(([code, name]) => ({
        code,
        name
    }));

    useEffect(() => {
        const isItaly = formData.nazione === "Italia" || formData.nazione === "IT";
        if (open && isItaly && regioni.length === 0) {
            fetch("https://comuni-ita.nicolorebaioli.dev/regioni")
                .then(res => res.json())
                .then(data => setRegioni(data))
                .catch(err => console.error("Errore caricamento regioni", err));
        }

        if (!isItaly && open) {
            if (regioni.length) setRegioni([]);
            if (province.length) setProvince([]);
            if (comuni.length) setComuni([]);
        }
    }, [open, formData.nazione]);

    // Caricamento Province quando cambia la regione
    const loadProvince = (regioneNome: string | null) => {
        if (!regioneNome) {
            setProvince([]);
            return;
        }
        fetch(`https://comuni-ita.nicolorebaioli.dev/province?regione=${encodeURIComponent(regioneNome)}`)
            .then(res => res.json())
            .then(data => {
                console.log(data)
                setProvince(data);
            })
            .catch(err => console.error("Errore caricamento province", err));
    };

    // Caricamento Comuni quando cambia la provincia
    const loadComuni = (provinciaNome: string | null) => {
        if (!provinciaNome) {
            setComuni([]);
            return;
        }
        fetch(`https://comuni-ita.nicolorebaioli.dev/comuni?provincia=${encodeURIComponent(provinciaNome)}`)
            .then(res => res.json())
            .then(data => {
                setComuni(data);
            })
            .catch(err => console.error("Errore caricamento comuni", err));
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({ nome: "", cognome: "", codice_fiscale: "", datanascita: "", nazione: "Italia", regione: "", provincia: "", comune: "", sesso: "", cellulare: "", mail: "", cv: "", contratto: "" });
        setProvince([]);
        setComuni([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/docenti`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                handleClose();
                router.refresh();
            } else {
                const errorData = await res.json();
                alert(`Errore: ${errorData.error || res.statusText}`);
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
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                Nuovo Docente
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Aggiungi Nuovo Docente</DialogTitle>
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
                                        setProvince([]);
                                        setComuni([]);
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
                                        const newRegione = val || "";
                                        setFormData({ ...formData, regione: newRegione, provincia: "", comune: "" });
                                        setComuni([]); // Pulisco i comuni perché cambio regione
                                        loadProvince(newRegione);
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
                                    onChange={(_, val) => {
                                        setFormData({ ...formData, provincia: val?.nome || "", comune: "" });
                                        loadComuni(val?.nome ?? "");
                                    }}
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
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Salva"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}