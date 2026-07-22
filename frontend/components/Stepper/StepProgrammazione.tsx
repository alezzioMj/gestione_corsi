"use client";

import React, { useMemo } from "react";
import { Box, Typography, Paper } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useFormContext } from "react-hook-form";
import { FormType, ProgrammaConModuli } from "./MyStepper";
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

function SortableModuloItem({ modulo }: { modulo: any }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: modulo.uniqueId,
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
                gap: 2,
                bgcolor: isDragging ? "action.hover" : "background.paper",
                boxShadow: isDragging ? 3 : 0,
                touchAction: 'none'
            }}
        >
            <Box {...attributes} {...listeners} sx={{ cursor: "grab", display: "flex", alignItems: "center" }}>
                <DragIndicatorIcon color="action" />
            </Box>
            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {modulo.titolo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {modulo.n_ore} ore - {modulo.competenza}
                </Typography>
            </Box>
        </Paper>
    );
}

export default function StepProgrammazione({ programmi }: { programmi: ProgrammaConModuli[] }) {
    const { watch, setValue } = useFormContext<FormType>();
    
    const selectedProgramId = watch("programmi");
    const moduliOrdinati = watch("moduliOrdinati") || [];

    const selectedProgram = useMemo(() => 
        programmi.find(p => p.id === selectedProgramId), 
    [programmi, selectedProgramId]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const orderedModuliData = useMemo(() => {
        if (!selectedProgram) return [];
        return moduliOrdinati.map(uniqueId => {
            const moduloId = Number(uniqueId.split('-')[0]);
            const rel = selectedProgram.programma_modulo.find(pm => pm.modulo_id === moduloId);
            return { uniqueId, titolo: rel?.modulo.titolo || `Modulo ${moduloId}`, n_ore: rel?.modulo.n_ore, competenza: rel?.modulo.competenza };
        });
    }, [moduliOrdinati, selectedProgram]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = moduliOrdinati.indexOf(active.id as string);
            const newIndex = moduliOrdinati.indexOf(over.id as string);
            setValue("moduliOrdinati", arrayMove(moduliOrdinati, oldIndex, newIndex), { shouldValidate: true });
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Programmazione Moduli</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Trascina i moduli per definire l'ordine delle lezioni.</Typography>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={moduliOrdinati} strategy={verticalListSortingStrategy}>
                    {orderedModuliData.map((modulo) => <SortableModuloItem key={modulo.uniqueId} modulo={modulo} />)}
                </SortableContext>
            </DndContext>
        </Box>
    );
}
