"use client";

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
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { FormType, DocenteConModuli } from "@/validation/corso-form.schema";
import GIORNI_SETTIMANA from "@/lib/docenti/docenti";

export default function StepDocenti({
  docenti,
}: {
  docenti: DocenteConModuli[];
}) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<FormType>();

  const handleTimeChange = (name: string, newValue: dayjs.Dayjs | null) => {
    if (!newValue || !newValue.isValid()) return;

    const formattedValue = newValue.format("HH:mm");
    setValue(name as keyof FormType, formattedValue, { shouldValidate: true });

    // Se cambia l'orario di inizio, calcola +4 ore per la fine
    if (name === "mattina_inizio") {
      const fineMattina = newValue.add(4, "hour").format("HH:mm");
      setValue("mattina_fine" as keyof FormType, fineMattina, { shouldValidate: true });
    } else if (name === "pomeriggio_inizio") {
      const finePomeriggio = newValue.add(4, "hour").format("HH:mm");
      setValue("pomeriggio_fine" as keyof FormType, finePomeriggio, { shouldValidate: true });
    }
  };

  const fields = [
    { name: "mattina_inizio", label: "Inizio Mattina", isReadOnly: false },
    { name: "mattina_fine", label: "Fine Mattina", isReadOnly: true },
    { name: "pomeriggio_inizio", label: "Inizio Pomeriggio", isReadOnly: false },
    { name: "pomeriggio_fine", label: "Fine Pomeriggio", isReadOnly: true },
  ];

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
                {docenti.map((d) => (
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
                        checked={field.value?.includes(g.value) || false}
                        onChange={(e) => {
                          const currentValues = field.value || [];
                          const newValue = e.target.checked
                            ? [...currentValues, g.value]
                            : currentValues.filter((v: number) => v !== g.value);
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
          {fields.map((timeField) => (
            <Grid key={timeField.name} size={{ xs: 12, sm: 3 }}>
              <Controller
                name={timeField.name as keyof FormType}
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label={timeField.label}
                    value={field.value ? dayjs(Array.isArray(field.value) ? field.value[0] : field.value , "HH:mm") : null}
                    disabled={timeField.isReadOnly}
                    onChange={(newValue) => handleTimeChange(timeField.name, newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors[timeField.name as keyof FormType]
                      }
                    }}
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