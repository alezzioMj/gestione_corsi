"use client";

import * as React from "react";
import { Box, FormControl, MenuItem, InputLabel, OutlinedInput, Select, TextField, FormHelperText } from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { CreateSede, Sede } from "@progetto/shared/validation/sede.schema";
import { FormType } from "@progetto/shared/validation/types";

// Commessa come arriva da GET /commesse (con il cliente incluso)
export type CommessaOption = {
    id: number;
    codice_commessa: string;
    cliente?: { ragione_sociale: string } | null;
};

export default function StepForm({
    sedi,
    commesse,
}: {
    sedi: Sede[];
    commesse: CommessaOption[];
}) {

    const { control, formState: { errors } } = useFormContext<FormType>();

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
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
                    name="commessa_id"
                    control={control}
                    render={({ field }) => (
                        <FormControl variant="outlined" fullWidth margin="normal" error={!!errors.commessa_id}>
                            <InputLabel id="commessa-label">Commessa</InputLabel>
                            <Select
                                labelId="commessa-label"
                                label="Commessa"
                                {...field}
                                value={field.value || ""}
                            >
                                {commesse.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.codice_commessa}
                                        {c.cliente ? ` - ${c.cliente.ragione_sociale}` : ""}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.commessa_id && <FormHelperText>{errors.commessa_id.message}</FormHelperText>}
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
                                value={field.value || []}
                            >
                                {sedi.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
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