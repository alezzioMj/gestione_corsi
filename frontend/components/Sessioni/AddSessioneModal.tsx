'use client'

import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FormDialog from "../common/FormDialog";
import { useModalForm } from "@/hooks/useModalForm";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useCorsi } from "@/hooks/useCorsi";
import EntitySelect from "../common/EntitySelect";
import DelayedLoading from "../DelayedLoading";
import { useSnackbar } from "../SnackbarContext";
import { useEffect } from "react";
import { useDocentiByCorso } from "@/hooks/useDocentiByCorso";
import { useSediByCorso } from "@/hooks/useSediByCorso";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Aula } from "@shared/validation/types";
import { useAuleBySede } from "@/hooks/useAuleBySede";
import { useModuliByCorso } from "@/hooks/useModuliByCorso";
import { ModuloRelation } from "@/validation/corso-form.schema";
import { API_BASE_URL } from "@/lib/config";
import { useCreateEntity } from "@/hooks/useCreateEntity";

type SessioneForm = {
    data: string | null,
    corso_id: number | null,
    docente_cf: string | null,
    modulo_id: number | null,
    sede_id: number | null,
    aula_id: number | null,
    ora_inizio: string | null,
    ora_fine: string | null,
    note: string | null
}

const EMPTY: SessioneForm = {
    data: null,
    corso_id: null,
    docente_cf: null,
    modulo_id: null,
    sede_id: null,
    aula_id: null,
    ora_inizio: null,
    ora_fine: null,
    note: null
}

interface AddSessioneModalProps {
    onSessioneAdded?: () => void;
}

export default function AddSessioneModal({onSessioneAdded}: AddSessioneModalProps) {
    const { open, openModal, closeModal, formData, setField } = useModalForm(EMPTY)
    const { corsi, isLoading: corsiIsLoading, error: corsiError } = useCorsi(open);
    const { docenti, isLoading: docenteIsLoading, error: docenteError } = useDocentiByCorso(open, formData.corso_id, formData.modulo_id);
    const { sedi, isLoading: sediIsLoading, error: sediError } = useSediByCorso(open, formData.corso_id);
    const { aule, isLoading: auleIsLoading, error: auleError } = useAuleBySede(open, formData.sede_id);
    const corso = corsi.find((c) => c.id === formData.corso_id);
    const { moduli, isLoading: moduliIsLoading, error: moduliError } = useModuliByCorso(open, corso?.programma_id);
    const { showMessage } = useSnackbar();

    const error = corsiError || moduliError || sediError || docenteError || auleError;
    useEffect(() => {
        if (error) {
            showMessage("Errore nel recupero dei dati", "error");
        }
    }, [error, showMessage]);
    const payload = { ...formData, priorita : 1 }
    const { submitting, create } = useCreateEntity(`${API_BASE_URL}/sessioni`);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await create(payload);
        if (ok) {
            closeModal();
            onSessioneAdded?.(); // se hai una callback per aggiornare la lista
        }
    };

    return (
        <>
            <>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openModal}>
                    Aggiungi Sessione
                </Button>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">

                    <FormDialog
                        open={open}
                        title={"Aggiungi Sessione"}
                        maxWidth={"md"}
                        onClose={closeModal}
                        onSubmit={handleSubmit}
                    >
                        {corsiIsLoading ? (
                            <DelayedLoading />
                        ) : (
                            <>
                                <EntitySelect
                                    label="Corso"
                                    options={corsi}
                                    getOptionId={(c) => c.id}
                                    value={formData.corso_id}
                                    getOptionLabel={(c) => c.nome}
                                    onChange={(id) => {
                                        setField("corso_id", id);
                                    }
                                    }
                                    required
                                />

                                <EntitySelect
                                    label="Modulo"
                                    options={moduli || []}
                                    getOptionId={(m: ModuloRelation) => m.modulo_id}
                                    value={formData.modulo_id}
                                    getOptionLabel={(m) => m.modulo.titolo}
                                    onChange={(id) => setField("modulo_id", id)}
                                    disabled={!formData.corso_id || moduliIsLoading || !moduli}
                                    required
                                />

                                <EntitySelect
                                    label="Docente"
                                    options={docenti}
                                    getOptionId={(d) => d.codice_fiscale}
                                    value={formData.docente_cf}
                                    getOptionLabel={(d) => `${d.nome} ${d.cognome}`}
                                    onChange={(id) => setField("docente_cf", id)}
                                    disabled={!formData.corso_id || docenteIsLoading}
                                    required
                                />

                                <EntitySelect
                                    label="Sede"
                                    options={sedi}
                                    getOptionId={(s) => s.id}
                                    value={formData.sede_id}
                                    getOptionLabel={(s) => s.nome}
                                    onChange={(id) => setField("sede_id", id)}
                                    disabled={!formData.corso_id || sediIsLoading}
                                    required
                                />

                                <EntitySelect
                                    label="Aula"
                                    options={aule}
                                    getOptionId={(a: Aula) => a.id}
                                    value={formData.aula_id}
                                    getOptionLabel={(s) => s.nome}
                                    onChange={(id) => setField("aula_id", id)}
                                    disabled={!formData.sede_id || auleIsLoading}
                                    required
                                />

                                <DatePicker
                                    label="Data"
                                    value={formData.data ? dayjs(formData.data) : null}
                                    onChange={(value) => setField("data", value ? value.format('YYYY-MM-DD') : "")}
                                />

                                <TimePicker
                                    label="Orario di inizio"
                                    value={formData.ora_inizio ? dayjs(formData.ora_inizio, "HH:mm") : null}
                                    onChange={(newValue) => {
                                        const oraInizio = newValue ? newValue.format("HH:mm") : null;
                                        const oraFine = newValue ? newValue.add(4, "hours").format("HH:mm") : null;
                                        setField("ora_inizio", oraInizio);
                                        setField("ora_fine", oraFine);
                                    }}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />

                                <TimePicker
                                    label="Orario di fine"
                                    value={formData.ora_fine ? dayjs(formData.ora_fine, "HH:mm") : null}
                                    disabled
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </>)}
                    </FormDialog >
                </LocalizationProvider>
            </>

        </>
    )
}