"use client";

import React, { useState } from "react";
import { Box, Checkbox, FormControlLabel, IconButton, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor,
    useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Modulo } from "@progetto/shared/validation/modulo.schema";

/** Riepilogo ore dai moduli selezionati (usa n_ore del modulo, default 4) */
export function calcOre(moduli: Modulo[]) {
    const tot = { durata_totale: 0, ore_pratiche: 0, ore_teoriche: 0, ore_trasversali: 0 };
    for (const m of moduli) {
        const ore = m.n_ore ?? 4;
        tot.durata_totale += ore;
        if (m.competenza === "Pratica") tot.ore_pratiche += ore;
        else if (m.competenza === "Teorica") tot.ore_teoriche += ore;
        else tot.ore_trasversali += ore;
    }
    return tot;
}

const label = (m: Modulo) => `${m.titolo} (${m.n_ore ?? 4}h - ${m.competenza})`;

function SortableItem({ modulo, onRemove }: { modulo: Modulo; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: modulo.id });

    return (
        <Paper
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            variant="outlined"
            sx={{
                p: 1.5, mb: 1, display: "flex", alignItems: "center", gap: 1,
                position: "relative", zIndex: isDragging ? 1000 : 1,
                bgcolor: isDragging ? "action.hover" : "background.paper",
                boxShadow: isDragging ? 3 : 0,
                touchAction: "none",
            }}
        >
            <Box {...attributes} {...listeners} sx={{ cursor: "grab", display: "flex", alignItems: "center" }}>
                <DragIndicatorIcon color="action" />
            </Box>
            <Typography sx={{ flexGrow: 1, fontSize: "0.875rem" }}>{label(modulo)}</Typography>
            <IconButton size="small" color="error" aria-label={`Rimuovi ${modulo.titolo}`} onClick={onRemove}>
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Paper>
    );
}

interface ModuliPickerProps {
    moduli: Modulo[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    /** Mostra la sequenza trascinabile (programmi). Senza, solo checklist (docenti). */
    sortable?: boolean;
}

export default function ModuliPicker({ moduli, selectedIds, onChange, sortable = false }: ModuliPickerProps) {
    const [query, setQuery] = useState("");
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const toggle = (id: number) => () =>
        onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;
        onChange(arrayMove(selectedIds, selectedIds.indexOf(active.id as number), selectedIds.indexOf(over.id as number)));
    };

    const selected = selectedIds
        .map((id) => moduli.find((m) => m.id === id))
        .filter((m): m is Modulo => !!m);
    const filtered = moduli.filter((m) => m.titolo.toLowerCase().includes(query.toLowerCase()));

    const catalog = (
        <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <TextField
                    fullWidth size="small" placeholder="Cerca modulo..."
                    value={query} onChange={(e) => setQuery(e.target.value)}
                />
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                    {selectedIds.length} selezionati
                </Typography>
            </Box>
            <Box sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }}>
                {filtered.map((m) => (
                    <FormControlLabel
                        key={m.id}
                        sx={{ display: "flex", ml: 0 }}
                        control={<Checkbox size="small" checked={selectedIds.includes(m.id)} onChange={toggle(m.id)} />}
                        label={<Typography variant="body2">{label(m)}</Typography>}
                    />
                ))}
            </Box>
        </>
    );

    if (!sortable) return catalog;

    return (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2, color: "primary.main" }}>
                    SEQUENZA (trascina per ordinare)
                </Typography>
                <Box sx={{ minHeight: 350, bgcolor: "action.hover", p: 2, borderRadius: 1, border: "1px dashed", borderColor: "divider" }}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={selectedIds} strategy={verticalListSortingStrategy}>
                            {selected.length > 0 ? (
                                selected.map((m) => <SortableItem key={m.id} modulo={m} onRemove={toggle(m.id)} />)
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 10, textAlign: "center" }}>
                                    Seleziona i moduli dal catalogo per comporre la sequenza.
                                </Typography>
                            )}
                        </SortableContext>
                    </DndContext>
                </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>CATALOGO MODULI</Typography>
                {catalog}
            </Grid>
        </Grid>
    );
}