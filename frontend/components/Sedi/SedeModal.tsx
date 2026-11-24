"use client";

import React, { useState } from "react";
import { TextField } from "@mui/material";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useUpdateEntity } from "@/hooks/useUpdateEntity";
import { EntityDialog, EntityFormShell } from "@/components/common/EntityFormShell";
import type { Sede } from "@progetto/shared/validation/sede.schema";

const KEYS = ["nome", "indirizzo", "civico", "cap", "citta", "provincia", "descrizione"] as const;
type SedeFormData = Record<(typeof KEYS)[number], string>;

const FIELDS: { key: keyof SedeFormData; label: string; required?: boolean; multiline?: boolean }[] = [
    { key: "nome", label: "Nome Sede", required: true },
    { key: "indirizzo", label: "Indirizzo", required: true },
    { key: "civico", label: "Civico" },
    { key: "cap", label: "CAP", required: true },
    { key: "citta", label: "Città", required: true },
    { key: "provincia", label: "Provincia", required: true },
    { key: "descrizione", label: "Descrizione", multiline: true },
];

const INITIAL_FORM: SedeFormData = {
    nome: "", indirizzo: "", civico: "", cap: "", citta: "", provincia: "", descrizione: "",
};

function toFormData(sede?: Sede | null): SedeFormData {
    if (!sede) return INITIAL_FORM;
    return {
        nome: sede.nome ?? "",
        indirizzo: sede.indirizzo ?? "",
        civico: sede.civico ?? "",
        cap: sede.cap ?? "",
        citta: sede.citta ?? "",
        provincia: sede.provincia ?? "",
        descrizione: sede.descrizione ?? "",
    };
}

interface SedeModalProps {
    open: boolean;
    sede?: Sede | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SedeModal({ open, sede, onClose, onSuccess }: SedeModalProps) {
    return (
        <EntityDialog open={open} onClose={onClose} size="sm">
            <SedeForm key={sede?.id ?? "new"} sede={sede} onClose={onClose} onSuccess={onSuccess} />
        </EntityDialog>
    );
}

function SedeForm({ sede, onClose, onSuccess }: Omit<SedeModalProps, "open">) {
    const [formData, setFormData] = useState<SedeFormData>(() => toFormData(sede));
    const { submitting: creating, create } = useCreateEntity<SedeFormData, Sede>("/sedi", "Sede creata!");
    const { submitting: updating, update } = useUpdateEntity<SedeFormData, Sede>("/sedi", "Sede aggiornata!");

    const handleSubmit = async () => {
        const ok = sede ? await update(sede.id, formData) : await create(formData);
        if (ok) onSuccess();
    };

    return (
        <EntityFormShell
            title={sede ? "Modifica Sede" : "Nuova Sede"}
            submitLabel={sede ? "Salva Modifiche" : "Crea Sede"}
            submitting={creating || updating}
            onSubmit={handleSubmit}
            onClose={onClose}
        >
            {FIELDS.map((f) => (
                <TextField
                    key={f.key}
                    label={f.label}
                    fullWidth
                    required={f.required}
                    multiline={f.multiline}
                    rows={f.multiline ? 3 : undefined}
                    value={formData[f.key]}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))}
                />
            ))}
        </EntityFormShell>
    );
}