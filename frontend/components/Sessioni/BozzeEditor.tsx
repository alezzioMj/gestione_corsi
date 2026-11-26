import { fetcher } from "@/lib/swr-config";
import { Stack, Typography, Alert, Button, Chip, MenuItem, Paper, TextField } from "@mui/material";
import useSWR from "swr";
import AsyncContent from "../AsyncContent";
import { useAuleBySede } from "@/hooks/useAuleBySede";
import { useUpdateEntity } from "@/hooks/useUpdateEntity";
import React from "react";
import SaveIcon from "@mui/icons-material/Save"

type Conflitto = { code: string; message: string };

type Bozza = {
    id: number;
    data: string;
    ora_inizio: string;
    ora_fine: string;
    modulo_id: number | null;
    docente_cf: string | null;
    sede_id: number | null;
    aula_id: number | null;
    note: string | null;
    modulo?: { titolo: string } | null;
};

type BozzeResponse = {
    bozze: Bozza[];
    conflitti: { id: number; conflitti: Conflitto[] }[];
    incomplete: number[];
};

type SessionePatch = {
    data: string;
    ora_inizio: string;
    ora_fine: string;
    docente_cf?: string;
    sede_id?: number;
    aula_id?: number;
    note: string | null;
};

type RowForm = {
    data: string;
    ora_inizio: string;
    ora_fine: string;
    docente_cf: string;
    sede_id: string;
    aula_id: string;
    note: string;
};

const toRowForm = (b: Bozza): RowForm => ({
    data: b.data.slice(0, 10),
    ora_inizio: b.ora_inizio.slice(0, 5),
    ora_fine: b.ora_fine.slice(0, 5),
    docente_cf: b.docente_cf ?? "",
    sede_id: b.sede_id ? String(b.sede_id) : "",
    aula_id: b.aula_id ? String(b.aula_id) : "",
    note: b.note ?? "",
});

export type DocenteOption = {
    codice_fiscale: string;
    nome: string;
    cognome: string;
    docente_modulo?: { modulo_id: number }[]; // se manca, non si filtra per modulo
};
export type SedeOption = { id: number; nome: string };

export type { Bozza, BozzeResponse };
export const bozzeKey = (corsoId: number) => `/corsi/${corsoId}/scheduling`;

interface Props {
    corsoId: number;
    docenti: DocenteOption[];
    sedi: SedeOption[];
}

export default function BozzeEditor({ corsoId, docenti, sedi }: Props) {
    const { data, error, mutate } = useSWR<BozzeResponse>(bozzeKey(corsoId), fetcher);

    const conflittiPerId = new Map(data?.conflitti.map((c) => [c.id, c.conflitti] as const));
    const incomplete = new Set(data?.incomplete);
    return (
        <Stack spacing={2} sx={{ p: 2 }}>
            <Typography variant="h6">Bozze sessioni</Typography>
            <Typography variant="body2" color="text.secondary">
                Modifica data, orari, docente, sede e aula di ogni sessione e salva la riga. Le sessioni diventano
                definitive solo al passo successivo.
            </Typography>

            <AsyncContent
                data={data}
                error={error}
                onRetry={() => mutate()}
                empty={<Alert severity="warning">Nessuna bozza disponibile per questo corso.</Alert>}
                isEmpty={(d) => d.bozze.length === 0}
            >
                {(d) => (
                    <>
                        {d.conflitti.length > 0 || d.incomplete.length > 0 ? (
                            <Alert severity="warning">
                                {d.conflitti.length} sessioni in conflitto, {d.incomplete.length} incomplete: correggile
                                prima di confermare.
                            </Alert>
                        ) : (
                            <Alert severity="success">Nessun conflitto: puoi procedere alla conferma.</Alert>
                        )}

                        {d.bozze.map((b, index) => (
                            <BozzaRow
                                key={b.id}
                                bozza={b}
                                index={index}
                                conflitti={conflittiPerId.get(b.id) ?? []}
                                incompleta={incomplete.has(b.id)}
                                docenti={docenti}
                                sedi={sedi}
                                onSaved={() => mutate()}
                            />
                        ))}
                    </>
                )}
            </AsyncContent>
        </Stack>
    )
}


interface BozzaRowProps {
    bozza: Bozza;
    index: number;
    conflitti: Conflitto[];
    incompleta: boolean;
    docenti: DocenteOption[];
    sedi: SedeOption[];
    onSaved: () => void;
}

function BozzaRow({ bozza, index, conflitti, incompleta, docenti, sedi, onSaved }: BozzaRowProps) {
    const [form, setForm] = React.useState<RowForm>(() => toRowForm(bozza));
    const { update, submitting } = useUpdateEntity<SessionePatch, unknown>("/sessioni", "Sessione aggiornata");
    const { aule } = useAuleBySede(true, form.sede_id ? Number(form.sede_id) : null);

    const base = toRowForm(bozza);
    const dirty = (Object.keys(form) as (keyof RowForm)[]).some((k) => form[k] !== base[k]);
    const valid = !!form.data && form.ora_inizio < form.ora_fine && !!form.docente_cf && !!form.sede_id && !!form.aula_id;

    const docentiAbilitati = docenti.filter(
        (d) => !d.docente_modulo || d.docente_modulo.some((dm) => dm.modulo_id === bozza.modulo_id)
    );
    const messaggi = Array.from(new Set(conflitti.map((c) => c.message)));

    const set = <K extends keyof RowForm>(key: K, value: RowForm[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        const ok = await update(bozza.id, {
            data: form.data,
            ora_inizio: form.ora_inizio,
            ora_fine: form.ora_fine,
            docente_cf: form.docente_cf || undefined,
            sede_id: form.sede_id ? Number(form.sede_id) : undefined,
            aula_id: form.aula_id ? Number(form.aula_id) : undefined,
            note: form.note || null,
        });
        if (ok) onSaved(); // rilegge bozze e conflitti
    };

    return (
        <Paper
            variant="outlined"
            sx={{ p: 2, borderColor: messaggi.length > 0 || incompleta ? "warning.main" : "divider" }}
        >
            <Stack sx={{ alignItems: "center", justifyContent: "space-between", direction: "row", mb: 1.5 }}>
                <Stack spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", direction: "row", mb: 1.5 }}>
                    <Chip label={`#${index + 1}`} size="small" />
                    <Typography variant="subtitle1">{bozza.modulo?.titolo ?? `Sessione ${bozza.id}`}</Typography>
                    {dirty && <Chip label="Modifiche non salvate" size="small" color="info" variant="outlined" />}
                </Stack>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={!dirty || !valid || submitting}
                    onClick={handleSave}
                >
                    {submitting ? "Salvataggio..." : "Salva riga"}
                </Button>
            </Stack>

            {(messaggi.length > 0 || incompleta) && (
                <Stack sx={{ gap: 1, flexWrap: "wrap", direction: "row", mb: 1.5 }}>
                    {messaggi.map((m) => <Chip key={m} label={m} size="small" color="warning" />)}
                    {incompleta && <Chip label="Mancano docente, sede o aula" size="small" color="warning" />}
                </Stack>
            )}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 1.5 }}>
                <TextField
                    label="Data" type="date" size="small" value={form.data}
                    onChange={(e) => set("data", e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    label="Ora inizio" type="time" size="small" value={form.ora_inizio}
                    onChange={(e) => set("ora_inizio", e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    label="Ora fine" type="time" size="small" value={form.ora_fine}
                    error={!!form.ora_fine && form.ora_fine <= form.ora_inizio}
                    onChange={(e) => set("ora_fine", e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    select label="Docente" size="small" sx={{ minWidth: 200 }}
                    value={form.docente_cf}
                    onChange={(e) => set("docente_cf", e.target.value)}
                >
                    {docentiAbilitati.map((d) => (
                        <MenuItem key={d.codice_fiscale} value={d.codice_fiscale}>{d.nome} {d.cognome}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select label="Sede" size="small" sx={{ minWidth: 180 }}
                    value={form.sede_id}
                    // cambiando sede l'aula va riscelta
                    onChange={(e) => setForm((prev) => ({ ...prev, sede_id: e.target.value, aula_id: "" }))}
                >
                    {sedi.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.nome}</MenuItem>)}
                </TextField>
                <TextField
                    select label="Aula" size="small" sx={{ minWidth: 160 }}
                    value={form.aula_id} disabled={!form.sede_id}
                    onChange={(e) => set("aula_id", e.target.value)}
                >
                    {aule.map((a) => <MenuItem key={a.id} value={String(a.id)}>{a.nome}</MenuItem>)}
                </TextField>
            </Stack>

            <TextField
                label="Note" size="small" fullWidth value={form.note}
                onChange={(e) => set("note", e.target.value)}
            />
        </Paper>
    );
}