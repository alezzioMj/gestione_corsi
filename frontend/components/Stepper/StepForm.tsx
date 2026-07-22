"use client";

import * as React from "react";
import { Box, FormControl, MenuItem, InputLabel, OutlinedInput, Select, TextField, FormHelperText } from "@mui/material";
import { Sede } from "../../validation/types";
import { FormType, ProgrammaConModuli } from "./MyStepper"; // Import FormType and ProgrammaConModuli
import { useFormContext, Controller } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function StepForm({
    sedi,
    programmi,
}: {
    sedi: Sede[];
    programmi: ProgrammaConModuli[]; // Changed to ProgrammaConModuli to access durata_totale
}) {
    const { control, formState: { errors }, watch, setValue, getValues } = useFormContext<FormType>();

    const selectedProgramId = watch("programmi");

    React.useEffect(() => {
        const program = programmi.find(p => p.id === selectedProgramId);
        const currentOreTotali = getValues("oreTotali");
        const currentNome = getValues("nome");

        if (program) {
            // Auto-popola il nome del corso se è vuoto
            if (!currentNome) {
                setValue("nome", program.titolo, { shouldValidate: true });
            }

            // If the current oreTotali is less than the program's duration, enforce the minimum
            if (currentOreTotali < program.durata_totale) {
                setValue("oreTotali", program.durata_totale, { shouldValidate: true });
            }
            // Initialize moduliOrdinati with the default order from the program
            // Se un modulo ha n_ripetizioni > 1, viene aggiunto più volte
            const moduleIds: string[] = [];
            program.programma_modulo.forEach(pm => {
                for (let i = 0; i < (pm.n_ripetizioni || 1); i++) {
                    moduleIds.push(`${pm.modulo_id}-${i}`);
                }
            });
            setValue("moduliOrdinati", moduleIds);
            // If currentOreTotali is already greater or equal, do nothing, allow user to keep higher value
        } else if (selectedProgramId === 0 && currentOreTotali !== 0) {
            // If no program is selected (id 0) and oreTotali is not 0, reset it
            setValue("oreTotali", 0, { shouldValidate: true });
            setValue("moduliOrdinati", []);
        }
    }, [selectedProgramId, programmi, setValue, getValues]); // getValues is stable, so it won't cause re-renders

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ p: 2 }}>
            <Controller
                name="nome" // Nome allineato al backend
                control={control}
                render={({ field }) => (
                    <FormControl variant="outlined" fullWidth margin="normal" error={!!errors.nome}>
                        <InputLabel>Nome Corso</InputLabel>
                        <OutlinedInput
                            label="Nome Corso"
                            {...field}
                        />
                        {errors.nome && <FormHelperText>{errors.nome.message}</FormHelperText>}
                    </FormControl>
                )}
            />

            <Controller
                name="cliente"
                control={control}
                render={({ field }) => (
                    <FormControl variant="outlined" fullWidth margin="normal" error={!!errors.cliente}>
                        <InputLabel>Cliente</InputLabel>
                        <OutlinedInput
                            label="Cliente"
                            {...field}
                        />
                        {errors.cliente && <FormHelperText>{errors.cliente.message}</FormHelperText>}
                    </FormControl>
                )}
            />

            <Controller
                name="sedi"
                control={control}
                render={({ field }) => (
                    <FormControl variant="outlined" fullWidth margin="normal" error={!!errors.sedi}>
                        <InputLabel id="sedi-label">Sedi</InputLabel>
                        <Select
                            multiple
                            labelId="sedi-label"
                            label="Sedi"
                            {...field}
                            value={field.value || []} // Assicura che il valore sia un array
                        >
                            {sedi.map((s) => (
                                <MenuItem key={s.nome} value={s.nome}>
                                    {s.nome}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.sedi && <FormHelperText>{errors.sedi.message}</FormHelperText>}
                    </FormControl>
                )}
            />

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

            <Controller
                name="dataInizio"
                control={control}
                render={({ field }) => (
                    <FormControl fullWidth margin="normal" error={!!errors.dataInizio}>
                        <DatePicker
                            label="Data Inizio"
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                            slotProps={{
                                textField: { 
                                    fullWidth: true, 
                                    variant: "outlined",
                                    error: !!errors.dataInizio
                                }
                            }}
                        />
                        {errors.dataInizio && <FormHelperText>{errors.dataInizio.message}</FormHelperText>}
                    </FormControl>
                )}
            />

            {/* DATA FINE CORSO */}
            <Controller
                name="dataFine"
                control={control}
                render={({ field }) => (
                    <FormControl fullWidth margin="normal" error={!!errors.dataFine}>
                        <DatePicker
                            label="Data Fine"
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                            slotProps={{
                                textField: { 
                                    fullWidth: true, 
                                    variant: "outlined",
                                    error: !!errors.dataFine
                                }
                            }}
                        />
                        {errors.dataFine && <FormHelperText>{errors.dataFine.message}</FormHelperText>}
                    </FormControl>
                )}
            />

            {/* NOTE */}
            <Controller
                name="note"
                control={control}
                render={({ field }) => (
                    <FormControl fullWidth margin="normal" error={!!errors.note}>
                        <TextField
                            label="Note"
                            placeholder="Inserisci eventuali dettagli aggiuntivi..."
                            multiline
                            rows={4}
                            variant="outlined"
                            {...field}
                        />
                        {errors.note && <FormHelperText>{errors.note.message}</FormHelperText>}
                    </FormControl>
                )}
            />
        </Box>
        </LocalizationProvider>
    );
}