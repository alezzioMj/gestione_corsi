"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StepDocenti;
const React = __importStar(require("react"));
const material_1 = require("@mui/material");
const react_hook_form_1 = require("react-hook-form");
const TimePicker_1 = require("@mui/x-date-pickers/TimePicker");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const AdapterDayjs_1 = require("@mui/x-date-pickers/AdapterDayjs");
const dayjs_1 = __importDefault(require("dayjs"));
const GIORNI_SETTIMANA = [
    { label: "Dom", value: 0 },
    { label: "Lun", value: 1 },
    { label: "Mar", value: 2 },
    { label: "Mer", value: 3 },
    { label: "Gio", value: 4 },
    { label: "Ven", value: 5 },
    { label: "Sab", value: 6 },
];
function StepDocenti({ docenti, }) {
    const { control, formState: { errors }, } = (0, react_hook_form_1.useFormContext)();
    return (<LocalizationProvider_1.LocalizationProvider dateAdapter={AdapterDayjs_1.AdapterDayjs}>
    <material_1.Box sx={{ p: 2 }}>
      <material_1.Typography variant="h6" gutterBottom>Selezione Docenti</material_1.Typography>
      <react_hook_form_1.Controller name="docenti" control={control} defaultValue={[]} render={({ field }) => (<material_1.FormControl variant="outlined" fullWidth margin="normal" error={!!errors.docenti}>
            <material_1.InputLabel id="docenti-label">Docenti</material_1.InputLabel>
            <material_1.Select labelId="docenti-label" multiple {...field} input={<material_1.OutlinedInput label="Docenti"/>} renderValue={(selected) => (<material_1.Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((codice_fiscale) => {
                    const doc = docenti.find((d) => d.codice_fiscale === codice_fiscale);
                    return <material_1.Chip key={doc?.codice_fiscale} label={doc ? `${doc.nome} ${doc.cognome}` : codice_fiscale}/>;
                })}
                </material_1.Box>)}>
              {docenti.map((d) => ( // Rimosso 'index' non utilizzato
            <material_1.MenuItem key={d.codice_fiscale} value={d.codice_fiscale}>
                  <material_1.Box>
                    <material_1.Typography variant="body1">{d.nome} {d.cognome}</material_1.Typography>
                    <material_1.Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Moduli: {d.docente_modulo?.map(m => m.modulo.titolo).join(", ") || "Nessuno"}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.MenuItem>))}
            </material_1.Select>
            {errors.docenti && (<material_1.FormHelperText>{errors.docenti.message}</material_1.FormHelperText>)}
          </material_1.FormControl>)}/>

      <material_1.Divider sx={{ my: 3 }}/>
      
      <material_1.Typography variant="h6" gutterBottom>Giorni di lezione</material_1.Typography>
      <react_hook_form_1.Controller name="giorni" control={control} render={({ field }) => (<material_1.FormControl error={!!errors.giorni} component="fieldset">
            <material_1.FormGroup row>
              {GIORNI_SETTIMANA.map((g) => (<material_1.FormControlLabel key={g.value} control={<material_1.Checkbox checked={field.value.includes(g.value)} onChange={(e) => {
                        const newValue = e.target.checked
                            ? [...field.value, g.value]
                            : field.value.filter((v) => v !== g.value);
                        field.onChange(newValue);
                    }}/>} label={g.label}/>))}
            </material_1.FormGroup>
            {errors.giorni && <material_1.FormHelperText>{errors.giorni.message}</material_1.FormHelperText>}
          </material_1.FormControl>)}/>

      <material_1.Divider sx={{ my: 3 }}/>

      <material_1.Typography variant="h6" gutterBottom>Orari Standard</material_1.Typography>
      <material_1.Grid container spacing={2}>
        {[
            { name: "mattina_inizio", label: "Inizio Mattina" },
            { name: "mattina_fine", label: "Fine Mattina" },
            { name: "pomeriggio_inizio", label: "Inizio Pomeriggio" },
            { name: "pomeriggio_fine", label: "Fine Pomeriggio" }
        ].map((timeField) => (<material_1.Grid xs={12} sm={3} key={timeField.name}>
            <react_hook_form_1.Controller name={timeField.name} // Corretto il tipo da 'any'
         control={control} render={({ field }) => (<TimePicker_1.TimePicker label={timeField.label} value={(0, dayjs_1.default)(field.value, "HH:mm")} onChange={(newValue) => field.onChange(newValue?.format("HH:mm"))} slotProps={{ textField: { fullWidth: true, error: !!errors[timeField.name] } }}/>)}/>
          </material_1.Grid>))}
      </material_1.Grid>
    </material_1.Box>
    </LocalizationProvider_1.LocalizationProvider>);
}
