
'use client'

import DelayedLoading from "@/components/DelayedLoading";
import { API_BASE_URL } from "@/lib/config";
import { fetcher } from "@/lib/swr-config";
import { useSnackbar } from "@/components/SnackbarContext";
import { ErrorOutlineOutlined } from "@mui/icons-material";
import {
    Box,
    Button,
    Container,
    Divider,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import { Aula } from "@progetto/shared/validation/aula.schema";
import { Docente } from "@progetto/shared/validation/docente.schema";
import { Sede } from "@progetto/shared/validation/sede.schema";
import { useState } from "react";
import useSWR from "swr";

type Oggetto = "DOCENTE" | "SEDE" | "AULA" | "";

const initialFormData = {
    docente_cf: "",
    sede_id: null as number | null,
    aula_id: null as number | null,
    data_inizio: "",
    data_fine: "",
    ora_inizio: "",
    ora_fine: "",
    causale: "",
    descrizione: ""
};

export default function IndisponibilitaPage() {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [oggetto, setOggetto] = useState<Oggetto>("");

    const { showMessage } = useSnackbar();

    const {
        data: docenti,
        isLoading: docentiLoading,
        error: docentiError
    } = useSWR<Docente[]>(`${API_BASE_URL}/docenti`, fetcher);

    const {
        data: sedi,
        isLoading: sediLoading,
        error: sediError
    } = useSWR<Sede[]>(`${API_BASE_URL}/sedi`, fetcher);

    const {
        data: aule,
        isLoading: auleLoading,
        error: auleError
    } = useSWR<Aula[]>(`${API_BASE_URL}/aule`, fetcher);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setSubmitting(true);

            const payload = {
                ...formData,
                docente_cf: oggetto === "DOCENTE" ? formData.docente_cf : null,
                sede_id: oggetto === "SEDE" ? formData.sede_id : null,
                aula_id: oggetto === "AULA" ? formData.aula_id : null
            };

            const res = await fetch(`${API_BASE_URL}/indisponibilita`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(
                    error.error || error.message || "Errore nell'invio dei dati."
                );
            }

            showMessage("Indisponibilità aggiunta correttamente.", "success");

            setFormData(initialFormData);
            setOggetto("");

        } catch (error: unknown) {
            console.error("Errore:", error);

            showMessage(
                error instanceof Error
                    ? error.message
                    : "Errore di rete durante l'invio.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const renderOptions = <T,>(
        loading: boolean,
        error: boolean,
        items: T[] | undefined,
        getId: (item: T) => string | number,
        getName: (item: T) => string
    ) => {
        if (loading) return <DelayedLoading />;

        if (error) {
            return (
                <Container>
                    <ErrorOutlineOutlined />
                    <Typography>
                        Impossibile caricare gli elementi
                    </Typography>
                </Container>
            );
        }

        return (items ?? []).map(item => (
            <MenuItem key={getId(item)} value={getId(item)}>
                {getName(item)}
            </MenuItem>
        ));
    };

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    mt: 1
                }}
            >
                <Typography variant="h5">
                    Nuova indisponibilità
                </Typography>

                <Typography variant="subtitle2" color="primary">
                    {"Informazioni sull'indisponibilità"}
                </Typography>

                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2
                }}>
                    <TextField
                        required
                        select
                        label="Oggetto"
                        fullWidth
                        value={oggetto}
                        onChange={(e) => {
                            const value = e.target.value as Oggetto;
                            setOggetto(value);

                            setFormData(prev => ({
                                ...prev,
                                docente_cf: "",
                                sede_id: null,
                                aula_id: null
                            }));
                        }}
                    >
                        <MenuItem value="DOCENTE">Docente</MenuItem>
                        <MenuItem value="SEDE">Sede</MenuItem>
                        <MenuItem value="AULA">Aula</MenuItem>
                    </TextField>

                    <TextField
                        required
                        select
                        label={
                            oggetto === "DOCENTE" ? "Docente"
                                : oggetto === "SEDE" ? "Sede"
                                    : oggetto === "AULA" ? "Aula"
                                        : ""
                        }
                        disabled={!oggetto}
                        fullWidth
                        value={
                            oggetto === "DOCENTE" ? formData.docente_cf
                                : oggetto === "SEDE" ? formData.sede_id?.toString() ?? ""
                                    : oggetto === "AULA" ? formData.aula_id?.toString() ?? ""
                                        : ""
                        }
                        onChange={(e) => {
                            const value = e.target.value;

                            setFormData(prev => ({
                                ...prev,
                                ...(oggetto === "DOCENTE" && { docente_cf: value }),
                                ...(oggetto === "SEDE" && {
                                    sede_id: value === "" ? null : Number(value)
                                }),
                                ...(oggetto === "AULA" && {
                                    aula_id: value === "" ? null : Number(value)
                                })
                            }));
                        }}
                    >
                        {
                            oggetto === "DOCENTE"
                                ? renderOptions(
                                    docentiLoading,
                                    docentiError,
                                    docenti,
                                    d => d.codice_fiscale,
                                    d => d.nome
                                )
                                : oggetto === "SEDE"
                                    ? renderOptions(
                                        sediLoading,
                                        sediError,
                                        sedi,
                                        s => s.id,
                                        s => s.nome
                                    )
                                    : oggetto === "AULA"
                                        ? renderOptions(
                                            auleLoading,
                                            auleError,
                                            aule,
                                            a => a.id,
                                            a => a.nome
                                        )
                                        : null
                        }
                    </TextField>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" color="primary">
                    Periodo di indisponibilità
                </Typography>

                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2
                }}>
                    <TextField
                        required
                        type="date"
                        label="Data inizio"
                        fullWidth
                        value={formData.data_inizio}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            data_inizio: e.target.value
                        }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField
                        required
                        type="date"
                        label="Data fine"
                        fullWidth
                        value={formData.data_fine}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            data_fine: e.target.value
                        }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField
                        required
                        type="time"
                        label="Ora inizio"
                        fullWidth
                        value={formData.ora_inizio}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            ora_inizio: e.target.value
                        }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField
                        required
                        type="time"
                        label="Ora fine"
                        fullWidth
                        value={formData.ora_fine}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            ora_fine: e.target.value
                        }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" color="primary">
                    Dettagli
                </Typography>

                <TextField
                    required
                    label="Causale"
                    fullWidth
                    value={formData.causale}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        causale: e.target.value
                    }))}
                />

                <TextField
                    label="Descrizione"
                    fullWidth
                    multiline
                    minRows={3}
                    value={formData.descrizione}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        descrizione: e.target.value
                    }))}
                />

                <Button
                    disabled={submitting}
                    type="submit"
                    variant="contained"
                    sx={{ minWidth: "120px" }}
                >
                    {submitting ? "Invio in corso..." : "Aggiungi indisponibilità"}
                </Button>
            </Box>
        </Container>
    );
}
