"use client";

import { useMemo } from "react";
import { Box, Typography, Paper, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText, OutlinedInput } from "@mui/material";
import { AddCircleOutlineOutlined, RemoveCircleOutlineOutlined } from "@mui/icons-material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Controller, useFormContext } from "react-hook-form";
import { FormType } from "@progetto/shared/validation/types";
import { ProgrammaWithRelations } from "@progetto/shared/validation/programma.schema";

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
import { Modulo } from "@progetto/shared/validation/modulo.schema";

type ModuloData = Partial<
    Pick<Modulo, "n_ore" | "competenza">
> & Pick<Modulo, "id" | "titolo" | "multiplo"> & {
    uniqueId: string;
};

interface SortableModuloItemProps {
    modulo: ModuloData & {
        uniqueId: string;
    };
    onAddInstance: (moduloId: number) => void;
    onRemoveInstance: (moduloId: string) => void;
}

function SortableModuloItem({ modulo, onAddInstance, onRemoveInstance }: SortableModuloItemProps) {
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
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {modulo.titolo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {modulo.n_ore} ore - {modulo.competenza}
                </Typography>
            </Box>
            {modulo.multiplo && (
                <>
                    <Button
                        size="small"
                        startIcon={<AddCircleOutlineOutlined />}
                        onClick={() => onAddInstance(modulo.id)}
                    >
                        Aggiungi un&apos;altra lezione
                    </Button>
                    <Button
                        size="small"
                        startIcon={<RemoveCircleOutlineOutlined />}
                        onClick={() => onRemoveInstance(modulo.uniqueId)}
                    >
                        Rimuovi istanza
                    </Button>
                </>
            )}
        </Paper>
    );
}

export default function StepProgrammazione({ programmi }: { programmi: ProgrammaWithRelations<"programma_modulo">[] }) {
    const { control, formState: { errors }, watch, setValue, getValues } = useFormContext<FormType>();
    const selectedProgramId = watch("programmi");
    const moduliOrdinati: string[] = watch("moduliOrdinati") || [];

    const handleProgramChange = (programId: number) => {
        console.log(JSON.stringify(programmi, null, 2));
        const programma = programmi.find(p => p.id === programId);

        setValue("programmi", programId, { shouldValidate: true, shouldDirty: true });

        if (!programma) {
            setValue("oreTotali", 0, { shouldValidate: true });
            setValue("moduliOrdinati", []);
            return;
        }
        if (!getValues("nome")) {
            setValue("nome", programma.titolo, { shouldValidate: true });
        }

        setValue("oreTotali", programma.durata_totale, { shouldValidate: true });

        // Ordine di default del programma; con n_ripetizioni > 1 il modulo compare piu' volte
        const moduleIds: string[] = [];
        programma.programma_modulo.forEach(m => {
            for (let i = 0; i < (m.n_ripetizioni || 1); i++) {
                moduleIds.push(`${m.modulo_id}-${i}`);
            }
        });
        setValue("moduliOrdinati", moduleIds);
    };


    const selectedProgram = useMemo(() =>
        programmi.find(p => p.id === selectedProgramId),
        [programmi, selectedProgramId]
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const orderedModuliData = useMemo(() => {
        if (!selectedProgram) return [];
        return moduliOrdinati.map(uniqueId => {
            const moduloId = Number(uniqueId.split('-')[0]);
            const rel = selectedProgram.programma_modulo.find(
                m => (m.modulo_id ?? m.modulo?.id) === moduloId
            );
            return {
                uniqueId,
                id: moduloId,
                titolo: rel?.modulo?.titolo || `Modulo ${moduloId}`,
                n_ore: rel?.modulo?.n_ore,
                competenza: rel?.modulo?.competenza,
                multiplo: rel?.modulo?.multiplo ?? true,
            };
        });
    }, [moduliOrdinati, selectedProgram]);

    // Handles generating a unique ID and appending a new instance of the module
    const handleAddModuloInstance = (moduloId: number) => {
        const newUniqueId = `${moduloId}-${crypto.randomUUID()}`;

        setValue("moduliOrdinati", [...moduliOrdinati, newUniqueId], {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });

        const oreTotali = getValues("oreTotali");
        setValue("oreTotali", oreTotali + 4, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
        })
    };

    const handleRemoveModuloInstance = (moduloId: string) => {
        const baseModuloId = moduloId.split('-')[0];
        const existingInstancesCount = moduliOrdinati.filter(id => id.startsWith(`${baseModuloId}-`)).length;
        if (existingInstancesCount <= 1) {
            return;
        }
        const newModuliOrdinati = moduliOrdinati.filter(mod => mod !== moduloId)

        setValue("moduliOrdinati", newModuliOrdinati, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });

        const oreTotali = getValues("oreTotali");
        setValue("oreTotali", oreTotali - 4, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
        })
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = moduliOrdinati.indexOf(active.id as string);
            const newIndex = moduliOrdinati.indexOf(over.id as string);

            setValue("moduliOrdinati", arrayMove(moduliOrdinati, oldIndex, newIndex), {
                shouldValidate: true,
                shouldDirty: true
            });
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Programmazione Corso</Typography>
            <Controller
                name="programmi"
                control={control}
                render={({ field }) => (
                    <FormControl variant="outlined" fullWidth margin="normal" error={!!errors.programmi}>
                        <InputLabel id="programmi-label">Programmi</InputLabel>
                        <Select
                            labelId="programmi-label"
                            label="Programmi"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => handleProgramChange(Number(e.target.value))}
                        >
                            {programmi.map((p) => (
                                <MenuItem key={p.id} value={p.id}> {/* Invia l'ID del programma */}
                                    {p.titolo}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.programmi && <FormHelperText>{errors.programmi.message as string}</FormHelperText>}
                    </FormControl>
                )}
            />

            <Controller
                name="oreTotali"
                control={control}
                render={({ field }) => (
                    <FormControl variant="outlined" fullWidth margin="normal" error={!!errors.oreTotali}>
                        <InputLabel>Ore totali</InputLabel>
                        <OutlinedInput
                            disabled
                            label="Ore totali"
                            type="number" // Imposta il tipo di input a number
                            {...field}
                            value={field.value === 0 ? "" : field.value} // Mostra stringa vuota per 0
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                        {errors.oreTotali && <FormHelperText>{errors.oreTotali.message}</FormHelperText>}
                    </FormControl>
                )}
            />

            <Typography variant="h6" gutterBottom>Ordine moduli</Typography>

            {orderedModuliData.length !== 0 ?
                <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Trascina i moduli per definire l&apos;ordine delle lezioni.
                    </Typography>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={moduliOrdinati} strategy={verticalListSortingStrategy}>
                            {orderedModuliData.map((modulo) => (
                                <SortableModuloItem
                                    key={modulo.uniqueId}
                                    modulo={modulo}
                                    onAddInstance={handleAddModuloInstance}
                                    onRemoveInstance={handleRemoveModuloInstance}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </>
                :
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Seleziona un programma per riordinarne i moduli.
                </Typography>
            }
        </Box>
    );
}