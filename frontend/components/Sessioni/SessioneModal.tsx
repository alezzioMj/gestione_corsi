"use client";

import React, { useState } from "react";
import { Alert } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useCorsi } from "@/hooks/useCorsi";
import { useDocentiByCorso } from "@/hooks/useDocentiByCorso";
import { useSediByCorso } from "@/hooks/useSediByCorso";
import { useAuleBySede } from "@/hooks/useAuleBySede";
import { useModuliByCorso } from "@/hooks/useModuliByCorso";
import { EntityDialog, EntityFormShell } from "@/components/common/EntityFormShell";
import EntitySelect from "@/components/common/EntitySelect";
import DelayedLoading from "@/components/DelayedLoading";
import type { Aula } from "@progetto/shared/validation/aula.schema";
import type { Modulo } from "@progetto/shared/validation/modulo.schema";

type SessioneFormData = {
    data: string | null;
    corso_id: number | null;
    docente_cf: string | null;
    modulo_id: number | null;
    sede_id: number | null;
    aula_id: number | null;
    ora_inizio: string | null;
    ora_fine: string | null;
    note: string | null;
};

const INITIAL_FORM: SessioneFormData = {
    data: null, corso_id: null, docente_cf: null, modulo_id: null,
    sede_id: null, aula_id: null, ora_inizio: null, ora_fine: null, note: null,
};

interface SessioneModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SessioneModal({ open, onClose, onSuccess }: SessioneModalProps) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
            <EntityDialog open={open} onClose={onClose} size="md">
                <SessioneForm onClose={onClose} onSuccess={onSuccess} />
            </EntityDialog>
        </LocalizationProvider>
    );
}

function SessioneForm({ onClose, onSuccess }: Omit<SessioneModalProps, "open">) {
    const [formData, setFormData] = useState<SessioneFormData>(INITIAL_FORM);
    const set = <K extends keyof SessioneFormData>(key: K, value: SessioneFormData[K]) =>
        setFormData((prev) => ({ ...prev, [key]: value }));

    const { corsi, isLoading: corsiLoading, error: corsiError } = useCorsi(true);
    const corso = corsi.find((c) => c.id === formData.corso_id);
    const { moduli, isLoading: moduliLoading, error: moduliError } = useModuliByCorso(true, corso?.programma_id);
    const { docenti, isLoading: docentiLoading, error: docentiError } = useDocentiByCorso(true, formData.corso_id, formData.modulo_id);
    const { sedi, isLoading: sediLoading, error: sediError } = useSediByCorso(true, formData.corso_id);
    const { aule, isLoading: auleLoading, error: auleError } = useAuleBySede(true, formData.sede_id);
    const loadError = corsiError || moduliError || docentiError || sediError || auleError;

    const { submitting, create } = useCreateEntity<SessioneFormData & { priorita: number }, unknown>(
        "/sessioni", "Sessione creata!"
    );

    const handleSubmit = async () => {
        const ok = await create({ ...formData, priorita: 1 });
        if (ok) onSuccess();
    };

    const canSubmit =
        !!formData.corso_id && !!formData.modulo_id && !!formData.docente_cf &&
        !!formData.sede_id && !!formData.aula_id && !!formData.data && !!formData.ora_inizio;

    return (
        <EntityFormShell
            title="Nuova Sessione"
            submitLabel="Crea Sessione"
            submitting={submitting}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
            onClose={onClose}
        >
            {loadError && <Alert severity="error">Errore nel recupero dei dati</Alert>}

            {corsiLoading ? (
                <DelayedLoading />
            ) : (
                <>
                    <EntitySelect
                        label="Corso" required
                        options={corsi}
                        getOptionId={(c) => c.id}
                        getOptionLabel={(c) => c.nome}
                        value={formData.corso_id}
                        onChange={(id) =>
                            setFormData((prev) => ({
                                ...prev, corso_id: id, modulo_id: null, docente_cf: null, sede_id: null, aula_id: null,
                            }))
                        }
                    />
                    <EntitySelect
                        label="Modulo" required
                        options={moduli?.map((pm) => pm.modulo).filter((m): m is Modulo => m !== null) ?? []}
                        getOptionId={(m) => m.id}
                        getOptionLabel={(m) => m.titolo}
                        value={formData.modulo_id}
                        disabled={!formData.corso_id || moduliLoading}
                        // il docente dipende dal modulo: va riscelto
                        onChange={(id) => setFormData((prev) => ({ ...prev, modulo_id: id, docente_cf: null }))}
                    />
                    <EntitySelect
                        label="Docente" required
                        options={docenti}
                        getOptionId={(d) => d.codice_fiscale}
                        getOptionLabel={(d) => `${d.nome} ${d.cognome}`}
                        value={formData.docente_cf}
                        disabled={!formData.corso_id || docentiLoading}
                        onChange={(id) => set("docente_cf", id)}
                    />
                    <EntitySelect
                        label="Sede" required
                        options={sedi}
                        getOptionId={(s) => s.id}
                        getOptionLabel={(s) => s.nome}
                        value={formData.sede_id}
                        disabled={!formData.corso_id || sediLoading}
                        onChange={(id) => setFormData((prev) => ({ ...prev, sede_id: id, aula_id: null }))}
                    />
                    <EntitySelect
                        label="Aula" required
                        options={aule}
                        getOptionId={(a: Aula) => a.id}
                        getOptionLabel={(a) => a.nome}
                        value={formData.aula_id}
                        disabled={!formData.sede_id || auleLoading}
                        onChange={(id) => set("aula_id", id)}
                    />

                    <DatePicker
                        label="Data"
                        sx={{ width: "100%" }}
                        value={formData.data ? dayjs(formData.data) : null}
                        onChange={(v) => set("data", v ? v.format("YYYY-MM-DD") : null)}
                    />
                    <TimePicker
                        label="Orario di inizio"
                        sx={{ width: "100%" }}
                        value={formData.ora_inizio ? dayjs(formData.ora_inizio, "HH:mm") : null}
                        onChange={(v) =>
                            setFormData((prev) => ({
                                ...prev,
                                ora_inizio: v ? v.format("HH:mm") : null,
                                ora_fine: v ? v.add(4, "hours").format("HH:mm") : null,
                            }))
                        }
                    />
                    <TimePicker
                        label="Orario di fine"
                        sx={{ width: "100%" }}
                        value={formData.ora_fine ? dayjs(formData.ora_fine, "HH:mm") : null}
                        disabled
                    />
                </>
            )}
        </EntityFormShell>
    );
}