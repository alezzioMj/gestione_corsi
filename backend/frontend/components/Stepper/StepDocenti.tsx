"use client";

import * as React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Grid,
} from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";
import { FormType, DocenteConModuli } from "./MyStepper"; // Import DocenteConModuli
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const GIORNI_SETTIMANA = [
  { label: "Dom", value: 0 },
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mer", value: 3 },
  { label: "Gio", value: 4 },
  { label: "Ven", value: 5 },
  { label: "Sab", value: 6 },
];

export default function StepDocenti({
  docenti,
}: {
  docenti: DocenteConModuli[]; // Usa il tipo DocenteConModuli
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<FormType>();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Selezione Docenti</Typography>
      <Controller
        name="docenti"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <FormControl
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!errors.docenti}
          >
            <InputLabel id="docenti-label">Docenti</InputLabel>
            <Select
              labelId="docenti-label"
              multiple
              {...field}
              input={<OutlinedInput label="Docenti" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((codice_fiscale) => {
                    const doc = docenti.find((d) => d.codice_fiscale === codice_fiscale);
                    return <Chip key={doc?.codice_fiscale} label={doc ? `${doc.nome} ${doc.cognome}` : codice_fiscale} />;
                  })}
                </Box>
              )}
            >
              {docenti.map((d) => ( // Rimosso 'index' non utilizzato
                <MenuItem key={d.codice_fiscale} value={d.codice_fiscale}>
                  <Box>
                    <Typography variant="body1">{d.nome} {d.cognome}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Moduli: {d.docente_modulo?.map(m => m.modulo.titolo).join(", ") || "Nessuno"}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.docenti && (
              <FormHelperText>{errors.docenti.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>Giorni di lezione</Typography>
      <Controller
        name="giorni"
        control={control}
        render={({ field }) => (
          <FormControl error={!!errors.giorni} component="fieldset">
            <FormGroup row>
              {GIORNI_SETTIMANA.map((g) => (
                <FormControlLabel
                  key={g.value}
                  control={
                    <Checkbox
                      checked={field.value.includes(g.value)}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? [...field.value, g.value]
                          : field.value.filter((v: number) => v !== g.value);
                        field.onChange(newValue);
                      }}
                    />
                  }
                  label={g.label}
                />
              ))}
            </FormGroup>
            {errors.giorni && <FormHelperText>{errors.giorni.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>Orari Standard</Typography>
      <Grid container spacing={2}>
        {[
          { name: "mattina_inizio", label: "Inizio Mattina" },
          { name: "mattina_fine", label: "Fine Mattina" },
          { name: "pomeriggio_inizio", label: "Inizio Pomeriggio" },
          { name: "pomeriggio_fine", label: "Fine Pomeriggio" }
        ].map((timeField) => (
          <Grid xs={12} sm={3} key={timeField.name}>
            <Controller
              name={timeField.name as keyof FormType} // Corretto il tipo da 'any'
              control={control}
              render={({ field }) => (
                <TimePicker
                  label={timeField.label}
                  value={dayjs(field.value, "HH:mm")}
                  onChange={(newValue) => field.onChange(newValue?.format("HH:mm"))}
                  slotProps={{ textField: { fullWidth: true, error: !!errors[timeField.name as keyof FormType] } }}
                />
              )}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
    </LocalizationProvider>
  );
}
