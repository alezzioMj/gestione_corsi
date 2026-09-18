"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    IconButton,
    Paper,
    CircularProgress,
    TextField,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
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

import { Programma } from "@shared/validation/types";
import { Modulo } from "@shared/validation/types";
import { API_ENDPOINTS } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";

interface AddModuloProgrammaModalProps {
    programma: Programma;
}

function SortableModuloItem({ modulo, onRemove }: { modulo: Modulo; onRemove: () => void }) {
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
            <Typography sx={{ flexGrow: 1, fontSize: '0.875rem' }}>{modulo.titolo}</Typography>
            <IconButton size="small" onClick={onRemove} color="error">
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Paper>
    );
}

export default function AddModuloProgrammaModal({ programma }: AddModuloProgrammaModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [moduli, setModuli] = useState<Modulo[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setSearchQuery("");
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const resModuli = await fetch(API_ENDPOINTS.moduli);
            const allModuli: Modulo[] = await resModuli.json();
            setModuli(allModuli);

            const resAssociazioni = await fetch(`${API_BASE_URL}/programmi/${programma.id}/moduli`, { cache: 'no-store' });
            if (resAssociazioni.ok) {
                const data = await resAssociazioni.json();
                const currentIds = data.map((m: Modulo) => m.id )
                setSelectedIds(currentIds);
            }
        } catch (error) {
            console.error("Errore fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (open) fetchData(); }, [open]);

    const handleToggle = (id: number) => () => {
        const currentIndex = selectedIds.indexOf(id);
        const newChecked = [...selectedIds];

        if (currentIndex === -1) {
            newChecked.push(id); // I nuovi aggiunti vanno in coda alla sequenza
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedIds(newChecked);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSelectedIds((items) => {
                const oldIndex = items.indexOf(active.id as number);
                const newIndex = items.indexOf(over.id as number);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/programmi/${programma.id}/moduli_bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ moduli_ids: selectedIds }),
            });
            if (res.ok) { 
                router.refresh(); 
                handleClose(); 
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const filteredModuli = useMemo(() => 
        moduli.filter(m => m.titolo.toLowerCase().includes(searchQuery.toLowerCase())),
        [moduli, searchQuery]
    );

    const orderedSelectedModuli = useMemo(() => 
        selectedIds.map(id => moduli.find(m => m.id === id)).filter(Boolean) as Modulo[],
        [selectedIds, moduli]
    );

    return (
        <>
            <Button variant="contained" size="small" onClick={handleOpen}>Configura Moduli</Button>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>Configura Didattica: {programma.titolo}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={4}>
                        {/* Colonna Sinistra: Sequenza Ordinabile */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                                SEQUENZA PROGRAMMA (Trascina per ordinare)
                            </Typography>
                            <Box sx={{ minHeight: 350, bgcolor: "auto.hover", p: 2, borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={selectedIds} strategy={verticalListSortingStrategy}>
                                        {orderedSelectedModuli.length > 0 ? (
                                            orderedSelectedModuli.map((modulo) => (
                                                <SortableModuloItem 
                                                    key={modulo.id} 
                                                    modulo={modulo} 
                                                    onRemove={handleToggle(modulo.id)} 
                                                />
                                            ))
                                        ) : (
                                            <Box sx={{ mt: 10, textAlign: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Seleziona i moduli dal catalogo<br/>per comporre il programma.
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
                                CATALOGO COMPLETO
                            </Typography>
                            <TextField 
                                fullWidth 
                                size="small" 
                                placeholder="Cerca modulo..." 
                                sx={{ mb: 2 }}
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                            />
                            <Box sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }}>
                                <Grid container spacing={0}>
                                    {filteredModuli.map((modulo) => (
                                        <Grid size={12} key={modulo.id}>
                                            <FormControlLabel
                                                sx={{ width: '100%', ml: 0 }}
                                                control={<Checkbox size="small" checked={selectedIds.includes(modulo.id)} onChange={handleToggle(modulo.id)} />}
                                                label={<Typography variant="body2">{modulo.titolo}</Typography>} 
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Annulla</Button>
                    <Button onClick={handleSave} variant="contained" disabled={loading} color="primary">
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Salva Configurazione"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}