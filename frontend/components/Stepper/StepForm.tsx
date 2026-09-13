"use client";

import * as React from "react";
import { Box, FormControl, MenuItem, InputLabel, OutlinedInput, Select, TextField, FormHelperText } from "@mui/material";
import { Sede } from "@shared/validation/types";
import { FormType } from "./MyStepper"; // Import FormType and ProgrammaConModuli
import { useFormContext, Controller } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function StepForm({
    sedi,
}: {
    sedi: Sede[];
    }) {
    
    const { control, formState: { errors } } = useFormContext<FormType>();
    
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