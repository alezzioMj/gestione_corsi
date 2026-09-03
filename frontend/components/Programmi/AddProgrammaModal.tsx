"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Box,
    Typography,
    Divider,
    IconButton,
    FormControlLabel,
    Checkbox,
    Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { API_BASE_URL } from "@/lib/config";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ModuloForProgram {
    id: number;
    titolo: string;
    competenza: "Teorica" | "Trasversale" | "Pratica";
    descrizione?: string;
}

interface AddProgrammaModalProps {
    onProgrammaAdded?: () => void;
}

function SortableModuloItem({ modulo, onRemove }: { modulo: ModuloForProgram; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: modulo.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
        position: 'relative' as const,
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            variant="outlined"
            sx={{
                p: 1.5,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: isDragging ? "action.hover" : "background.paper",
                boxShadow: isDragging ? 3 : 0,
                touchAction: 'none' // Necessario per il corretto funzionamento su touch
            }}
        >
            <Box {...attributes} {...listeners} sx={{ cursor: "grab", display: "flex", alignItems: "center" }}>
                <DragIndicatorIcon color="action" />
            </Box>
            <Typography sx={{ flexGrow: 1, fontSize: '0.875rem' }}>{modulo.titolo} (4h - {modulo.competenza})</Typography>
            <IconButton size="small" onClick={onRemove} color="error">
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Paper>
    );
}

export default function AddProgrammaModal({ onProgrammaAdded }: AddProgrammaModalProps) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        titolo: "",
        descrizione: "",
    });
    const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: allModuli = [], isLoading: isLoadingModuli, error: errorModuli } = useSWR<ModuloForProgram[]>(
        open ? "/moduli" : null,
        fetcher
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({ titolo: "", descrizione: "" });
        setSelectedModuleIds([]);
        setSearchQuery("");
    };

    const handleToggleModule = (id: number) => () => {
        setSelectedModuleIds((prev) => {
            const currentIndex = prev.indexOf(id);
            const newSelected = [...prev];

            if (currentIndex === -1) {
                newSelected.push(id);
            } else {
                newSelected.splice(currentIndex, 1);
            }
            return newSelected;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSelectedModuleIds((items) => {
                const oldIndex = items.indexOf(active.id as number);
                const newIndex = items.indexOf(over.id as number);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Filtered and ordered list of selected modules for display
    const orderedSelectedModuli = useMemo(() =>
        selectedModuleIds
            .map(id => allModuli.find(m => m.id === id))
            .filter(Boolean) as ModuloForProgram[],
        [selectedModuleIds, allModuli]
    );

    // Calculate total hours based on selected modules
    const { durata_totale, ore_pratiche, ore_teoriche, ore_trasversali } = useMemo(() => {
        let total = 0;
        let pratiche = 0;
        let teoriche = 0;
        let trasversali = 0;

        const ORE_BASE = 4;
        orderedSelectedModuli.forEach(m => {
            total += ORE_BASE;
            if (m.competenza === "Pratica") pratiche += ORE_BASE;
            else if (m.competenza === "Teorica") teoriche += ORE_BASE;
            else if (m.competenza === "Trasversale") trasversali += ORE_BASE;
        });

        return {
            durata_totale: total,
            ore_pratiche: pratiche,
            ore_teoriche: teoriche,
            ore_trasversali: trasversali,
        };
    }, [orderedSelectedModuli]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                durata_totale,
                ore_pratiche,
                ore_teoriche,
                ore_trasversali,
                moduli_ids: selectedModuleIds,
            };

            const res = await fetch(`${API_BASE_URL}/programmi/completo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                if (onProgrammaAdded) onProgrammaAdded();
                handleClose();
            } else {
                const errorData = await res.json();
                alert(`Errore: ${errorData.error || res.statusText}`);
            }
        } catch (error) {
            console.error("Errore invio:", error);
            alert("Errore di rete.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredAvailableModuli = useMemo(() =>
        allModuli.filter(m =>
            m.titolo.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !selectedModuleIds.includes(m.id)
        ),
        [allModuli, searchQuery, selectedModuleIds]
    );

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                Crea Nuovo Programma
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Crea Nuovo Programma Formativo</DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                            <Typography variant="subtitle2" color="primary">Dettagli Programma</Typography>
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

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" color="primary">Riepilogo Ore</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField label="Durata Totale (ore)" fullWidth value={durata_totale} InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField label="Ore Pratiche" fullWidth value={ore_pratiche} InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField label="Ore Teoriche" fullWidth value={ore_teoriche} InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField label="Ore Trasversali" fullWidth value={ore_trasversali} InputProps={{ readOnly: true }} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={4}>
                                {/* Colonna Sinistra: Sequenza Ordinabile */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                                        MODULI SELEZIONATI (Trascina per ordinare)
                                    </Typography>
                                    <Box sx={{ minHeight: 350, bgcolor: "action.hover", p: 2, borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={selectedModuleIds} strategy={verticalListSortingStrategy}>
                                                {orderedSelectedModuli.length > 0 ? (
                                                    orderedSelectedModuli.map((modulo) => (
                                                        <SortableModuloItem
                                                            key={modulo.id}
                                                            modulo={modulo}
                                                            onRemove={handleToggleModule(modulo.id)}
                                                        />
                                                    ))
                                                ) : (
                                                    <Box sx={{ mt: 10, textAlign: 'center' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Seleziona i moduli dal catalogo<br />per comporre il programma.
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </SortableContext>
                                        </DndContext>
                                    </Box>
                                </Grid>

                                {/* Colonna Destra: Catalogo Selezione */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                                        CATALOGO MODULI DISPONIBILI
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Cerca modulo..."
                                        sx={{ mb: 2 }}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {isLoadingModuli ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
                                    ) : errorModuli ? (
                                        <Typography color="error">Errore nel caricamento dei moduli.</Typography>
                                    ) : (
                                        <Box sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }}>
                                            <Grid container spacing={0}>
                                                {filteredAvailableModuli.map((modulo) => (
                                                    <Grid size={{ xs: 12, md: 6 }} key={modulo.id}>
                                                        <FormControlLabel
                                                            sx={{ width: '100%', ml: 0 }}
                                                            control={<Checkbox size="small" checked={selectedModuleIds.includes(modulo.id)} onChange={handleToggleModule(modulo.id)} />}
                                                            label={<Typography variant="body2">{modulo.titolo} (4h - {modulo.competenza})</Typography>}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={handleClose} color="inherit">Annulla</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting || !formData.titolo || selectedModuleIds.length === 0}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : "Crea Programma"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}