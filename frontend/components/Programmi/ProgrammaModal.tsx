"use client";

import React, { useState } from "react";
import { TextField, Typography, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useUpdateEntity } from "@/hooks/useUpdateEntity";
import { EntityDialog, EntityFormShell } from "@/components/common/EntityFormShell";
import AsyncContent from "@/components/AsyncContent";
import ModuliPicker, { calcOre } from "@/components/common/ModuliPicker";
import type { Programma } from "@progetto/shared/validation/programma.schema";
import type { Modulo } from "@progetto/shared/validation/modulo.schema";

type ProgrammaFormData = { titolo: string; descrizione: string };
type ProgrammaCompletoPayload = ProgrammaFormData & {
    durata_totale: number; ore_pratiche: number; ore_teoriche: number; ore_trasversali: number;
    moduli_ids: number[];
};

interface ProgrammaModalProps {
    open: boolean;
    programma?: Programma | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ProgrammaModal({ open, programma, onClose, onSuccess }: ProgrammaModalProps) {
    return (
        <EntityDialog open={open} onClose={onClose} size={programma ? "sm" : "lg"}>
            <ProgrammaForm key={programma?.id ?? "new"} programma={programma} onClose={onClose} onSuccess={onSuccess} />
        </EntityDialog>
    );
}

function ProgrammaForm({ programma, onClose, onSuccess }: Omit<ProgrammaModalProps, "open">) {
    const [formData, setFormData] = useState<ProgrammaFormData>(() => ({
        titolo: programma?.titolo ?? "",
        descrizione: programma?.descrizione ?? "",
    }));
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Catalogo necessario solo in creazione
    const { data: moduli, error } = useSWR<Modulo[]>(programma ? null : "/moduli", fetcher);

    const { submitting: creating, create } = useCreateEntity<ProgrammaCompletoPayload, Programma>(
        "/programmi/completo", "Programma creato!"
    );
    const { submitting: updating, update } = useUpdateEntity<ProgrammaFormData, Programma>(
        "/programmi", "Programma aggiornato!"
    );

    const selected = selectedIds
        .map((id) => moduli?.find((m) => m.id === id))
        .filter((m): m is Modulo => !!m);
    const ore = calcOre(selected);

    const handleSubmit = async () => {
        const ok = programma
            ? await update(programma.id, formData)
            : await create({ ...formData, ...ore, moduli_ids: selectedIds });
        if (ok) onSuccess();
    };

    return (
        <EntityFormShell
            title={programma ? "Modifica Programma" : "Nuovo Programma Formativo"}
            submitLabel={programma ? "Salva Modifiche" : "Crea Programma"}
            submitting={creating || updating}
            canSubmit={!!formData.titolo && (!!programma || selectedIds.length > 0)}
            onSubmit={handleSubmit}
            onClose={onClose}
        >
            <TextField
                label="Titolo Programma" fullWidth required
                value={formData.titolo}
                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
            />
            <TextField
                label="Descrizione (opzionale)" fullWidth multiline rows={3}
                value={formData.descrizione}
                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
            />

            {!programma && (
                <>
                    <Divider />
                    <Typography variant="subtitle2" color="primary">Riepilogo Ore</Typography>
                    <Grid container spacing={2}>
                        {([
                            ["Durata Totale (ore)", ore.durata_totale],
                            ["Ore Pratiche", ore.ore_pratiche],
                            ["Ore Teoriche", ore.ore_teoriche],
                            ["Ore Trasversali", ore.ore_trasversali],
                        ] as const).map(([label, value]) => (
                            <Grid key={label} size={{ xs: 12, md: 6 }}>
                                <TextField label={label} fullWidth value={value} disabled />
                            </Grid>
                        ))}
                    </Grid>

                    <Divider />
                    <AsyncContent
                        data={moduli}
                        error={error}
                        empty={<Typography color="text.secondary">Nessun modulo disponibile: creane uno prima.</Typography>}
                    >
                        {(list) => <ModuliPicker moduli={list} selectedIds={selectedIds} onChange={setSelectedIds} sortable />}
                    </AsyncContent>
                </>
            )}
        </EntityFormShell>
    );
}