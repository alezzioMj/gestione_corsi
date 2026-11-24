"use client";

import React, { useState } from "react";
import { TextField, MenuItem, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import * as countries from "i18n-iso-countries";
import itLocale from "i18n-iso-countries/langs/it.json";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { DOCENTE_COLORS } from "@progetto/shared/constants/docente";
import type { Docente } from "@progetto/shared/validation/docente.schema";
import ColorSwatchPicker from "@/components/common/ColorSwatchPicker";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useUpdateEntity } from "@/hooks/useUpdateEntity";
import { EntityDialog, EntityFormShell } from "@/components/common/EntityFormShell";
import EntitySelect from "../common/EntitySelect";

countries.registerLocale(itLocale);
const COUNTRY_OPTIONS = Object.entries(countries.getNames("it")).map(([code, name]) => ({ code, name }));
const COMUNI_API = "https://comuni-ita.nicolorebaioli.dev";

type Provincia = { codice: string; nome: string; regione: string; sigla: string };
type Comune = { nome: string };

type DocenteFormData = {
    colore: string; nome: string; cognome: string; codice_fiscale: string;
    datanascita: string; nazione: string; regione: string; provincia: string; comune: string;
    sesso: string; cellulare: string; mail: string; cv: string; contratto: string;
};

const INITIAL_FORM: DocenteFormData = {
    colore: DOCENTE_COLORS[0], nome: "", cognome: "", codice_fiscale: "", datanascita: "",
    nazione: "Italia", regione: "", provincia: "", comune: "", sesso: "",
    cellulare: "", mail: "", cv: "", contratto: "",
};

function toFormData(d?: Docente | null): DocenteFormData {
    if (!d) return INITIAL_FORM;
    return {
        colore: d.colore ?? DOCENTE_COLORS[0],
        nome: d.nome,
        cognome: d.cognome,
        codice_fiscale: d.codice_fiscale,
        datanascita: d.datanascita ? new Date(d.datanascita).toISOString().slice(0, 10) : "",
        nazione: d.nazione ?? "Italia",
        regione: d.regione ?? "",
        provincia: d.provincia ?? "",
        comune: d.comune ?? "",
        sesso: d.sesso ?? "",
        cellulare: d.cellulare ?? "",
        mail: d.mail ?? "",
        cv: d.cv ?? "",
        contratto: d.contratto ?? "",
    };
}

interface DocenteModalProps {
    open: boolean;
    docente?: Docente | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DocenteModal({ open, docente, onClose, onSuccess }: DocenteModalProps) {
    return (
        <EntityDialog open={open} onClose={onClose} size="md">
            <DocenteForm
                key={docente?.codice_fiscale ?? "new"}
                docente={docente}
                onClose={onClose}
                onSuccess={onSuccess}
            />
        </EntityDialog>
    );
}

function DocenteForm({ docente, onClose, onSuccess }: Omit<DocenteModalProps, "open">) {
    const [formData, setFormData] = useState<DocenteFormData>(() => toFormData(docente));
    const { submitting: creating, create } = useCreateEntity<DocenteFormData, Docente>("/docenti", "Docente creato!");
    const { submitting: updating, update } = useUpdateEntity<DocenteFormData, Docente>("/docenti", "Docente aggiornato!");

    const isItaly = formData.nazione === "Italia" || formData.nazione === "IT";

    // Il form è montato solo a dialog aperto, quindi non serve il flag "open" nelle chiavi
    const { data: regioni = [], error: regioniError } = useSWR<string[]>(
        isItaly ? `${COMUNI_API}/regioni` : null, fetcher
    );
    const { data: province = [], error: provinceError } = useSWR<Provincia[]>(
        isItaly && formData.regione ? `${COMUNI_API}/province?regione=${formData.regione}` : null, fetcher
    );
    const { data: comuni = [], error: comuniError } = useSWR<Comune[]>(
        isItaly && formData.provincia ? `${COMUNI_API}/comuni?provincia=${formData.provincia}` : null, fetcher
    );
    const geoError = regioniError || provinceError || comuniError;

    const set = <K extends keyof DocenteFormData>(key: K, value: DocenteFormData[K]) =>
        setFormData((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async () => {
        const ok = docente
            ? await update(docente.codice_fiscale, formData)
            : await create(formData);
        if (ok) onSuccess();
    };

    return (
        <EntityFormShell
            title={docente ? "Modifica Docente" : "Nuovo Docente"}
            submitLabel={docente ? "Salva Modifiche" : "Crea Docente"}
            submitting={creating || updating}
            canSubmit={!!formData.colore}
            onSubmit={handleSubmit}
            onClose={onClose}
        >
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Nome" fullWidth required value={formData.nome}
                        onChange={(e) => set("nome", e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Cognome" fullWidth required value={formData.cognome}
                        onChange={(e) => set("cognome", e.target.value)} />
                </Grid>
                <Grid size={12}>
                    <TextField label="Codice Fiscale" fullWidth required
                        disabled={!!docente} // è l'identificativo del docente
                        value={formData.codice_fiscale}
                        onChange={(e) => set("codice_fiscale", e.target.value.toUpperCase())} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Data di Nascita" type="date" fullWidth required
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={formData.datanascita}
                        onChange={(e) => set("datanascita", e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField select label="Sesso" fullWidth required value={formData.sesso}
                        onChange={(e) => set("sesso", e.target.value)}>
                        <MenuItem value="M">Maschio</MenuItem>
                        <MenuItem value="F">Femmina</MenuItem>
                        <MenuItem value="Altro">Altro</MenuItem>
                    </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Email" type="email" fullWidth required value={formData.mail}
                        onChange={(e) => set("mail", e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Cellulare" fullWidth value={formData.cellulare}
                        onChange={(e) => set("cellulare", e.target.value)} />
                </Grid>

                <EntitySelect
                    label="Nazione" required
                    options={COUNTRY_OPTIONS}
                    getOptionId={(c) => c.name}
                    getOptionLabel={(c) => c.name}
                    value={formData.nazione || null}
                    onChange={(name) =>
                        setFormData((prev) => ({ ...prev, nazione: name ?? "", regione: "", provincia: "", comune: "" }))
                    }
                />

                <EntitySelect
                    label="Regione" required={isItaly}
                    options={regioni}
                    getOptionId={(r) => r}
                    getOptionLabel={(r) => r}
                    value={formData.regione || null}
                    disabled={!isItaly}
                    onChange={(r) => setFormData((prev) => ({ ...prev, regione: r ?? "", provincia: "", comune: "" }))}
                />

                <EntitySelect
                    label="Provincia" required={isItaly}
                    options={province}
                    getOptionId={(p) => p.nome}
                    getOptionLabel={(p) => p.nome}
                    value={formData.provincia || null}
                    disabled={!isItaly || !formData.regione}
                    onChange={(nome) => setFormData((prev) => ({ ...prev, provincia: nome ?? "", comune: "" }))}
                />

                <EntitySelect
                    label="Comune" required={isItaly}
                    options={comuni}
                    getOptionId={(c) => c.nome}
                    getOptionLabel={(c) => c.nome}
                    value={formData.comune || null}
                    disabled={!isItaly || !formData.provincia}
                    onChange={(nome) => set("comune", nome ?? "")}
                />
                {geoError && (
                    <Grid size={12}>
                        <Typography color="error" variant="caption">
                            Impossibile caricare regioni, province o comuni. Riprova più tardi.
                        </Typography>
                    </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Contratto" placeholder="Es: P.IVA, Co.Co.Co" fullWidth
                        value={formData.contratto} onChange={(e) => set("contratto", e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Link CV" placeholder="URL o riferimento CV" fullWidth
                        value={formData.cv} onChange={(e) => set("cv", e.target.value)} />
                </Grid>

                <Grid size={12}>
                    <Typography variant="subtitle2" gutterBottom>Colore</Typography>
                    <ColorSwatchPicker value={formData.colore} onChange={(c) => set("colore", c)} />
                </Grid>
            </Grid>
        </EntityFormShell>
    );
}