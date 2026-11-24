"use client";

import React, { useState } from "react";
import { TextField } from "@mui/material";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useUpdateEntity } from "@/hooks/useUpdateEntity";
import { EntityDialog, EntityFormShell } from "@/components/common/EntityFormShell";
import type { Aula } from "@progetto/shared/validation/aula.schema";

type AulaFormData = { nome: string; capienza: string; descrizione: string };
type AulaPayload = { nome: string; capienza?: number; descrizione: string; sede_id: number };

const INITIAL_FORM: AulaFormData = { nome: "", capienza: "", descrizione: "" };

function toFormData(aula?: Aula | null): AulaFormData {
    if (!aula) return INITIAL_FORM;
    return {
        nome: aula.nome,
        capienza: aula.capienza != null ? String(aula.capienza) : "",
        descrizione: aula.descrizione ?? "",
    };
}

interface AulaModalProps {
    open: boolean;
    aula?: Aula | null;
    /** Necessario in creazione; in modifica vale aula.sede_id */
    sedeId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AulaModal({ open, aula, sedeId, onClose, onSuccess }: AulaModalProps) {
    return (
        <EntityDialog open={open} onClose={onClose} size="sm">
            <AulaForm key={aula?.id ?? "new"} aula={aula} sedeId={sedeId} onClose={onClose} onSuccess={onSuccess} />
        </EntityDialog>
    );
}

function AulaForm({ aula, sedeId, onClose, onSuccess }: Omit<AulaModalProps, "open">) {
    const [formData, setFormData] = useState<AulaFormData>(() => toFormData(aula));
    const { submitting: creating, create } = useCreateEntity<AulaPayload, Aula>("/aule", "Aula creata!");
    const { submitting: updating, update } = useUpdateEntity<AulaPayload, Aula>("/aule", "Aula aggiornata!");

    const handleSubmit = async () => {
        const payload: AulaPayload = {
            nome: formData.nome,
            capienza: formData.capienza === "" ? undefined : Number(formData.capienza),
            descrizione: formData.descrizione,
            sede_id: aula?.sede_id ?? sedeId,
        };
        const ok = aula ? await update(aula.id, payload) : await create(payload);
        if (ok) onSuccess();
    };

    return (
        <EntityFormShell
            title={aula ? "Modifica Aula" : "Nuova Aula"}
            submitLabel={aula ? "Salva Modifiche" : "Crea Aula"}
            submitting={creating || updating}
            canSubmit={!!formData.nome}
            onSubmit={handleSubmit}
            onClose={onClose}
        >
            <TextField
                label="Nome Aula" fullWidth required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            <TextField
                label="Capienza" type="number" fullWidth
                value={formData.capienza}
                onChange={(e) => setFormData({ ...formData, capienza: e.target.value })}
            />
            <TextField
                label="Descrizione" fullWidth
                value={formData.descrizione}
                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
            />
        </EntityFormShell>
    );
}