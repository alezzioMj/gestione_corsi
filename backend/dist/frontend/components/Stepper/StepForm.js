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
exports.default = StepForm;
const React = __importStar(require("react"));
const material_1 = require("@mui/material");
const react_hook_form_1 = require("react-hook-form");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const AdapterDayjs_1 = require("@mui/x-date-pickers/AdapterDayjs");
const dayjs_1 = __importDefault(require("dayjs"));
function StepForm({ sedi, programmi, }) {
    const { control, formState: { errors } } = (0, react_hook_form_1.useFormContext)();
    return (<LocalizationProvider_1.LocalizationProvider dateAdapter={AdapterDayjs_1.AdapterDayjs}>
        <material_1.Box sx={{ p: 2 }}>
            <react_hook_form_1.Controller name="nomeCorso" // Nuovo campo
     control={control} render={({ field }) => (<material_1.FormControl variant="outlined" fullWidth margin="normal" error={!!errors.nomeCorso}>
                        <material_1.InputLabel>Nome Corso</material_1.InputLabel>
                        <material_1.OutlinedInput label="Nome Corso" {...field}/>
                        {errors.nomeCorso && <material_1.FormHelperText>{errors.nomeCorso.message}</material_1.FormHelperText>}
                    </material_1.FormControl>)}/>

            <react_hook_form_1.Controller name="cliente" control={control} render={({ field }) => (<material_1.FormControl variant="outlined" fullWidth margin="normal" error={!!errors.cliente}>
                        <material_1.InputLabel>Cliente</material_1.InputLabel>
                        <material_1.OutlinedInput label="Cliente" {...field}/>
                        {errors.cliente && <material_1.FormHelperText>{errors.cliente.message}</material_1.FormHelperText>}
                    </material_1.FormControl>)}/>

            <react_hook_form_1.Controller name="sedi" control={control} render={({ field }) => (<material_1.FormControl variant="outlined" fullWidth margin="normal" error={!!errors.sedi}>
                        <material_1.InputLabel id="sedi-label">Sedi</material_1.InputLabel>
                        <material_1.Select multiple labelId="sedi-label" label="Sedi" {...field} value={field.value || []} // Assicura che il valore sia un array
        >
                            {sedi.map((s) => (<material_1.MenuItem key={s.nome} value={s.nome}>
                                    {s.nome}
                                </material_1.MenuItem>))}
                        </material_1.Select>
                        {errors.sedi && <material_1.FormHelperText>{errors.sedi.message}</material_1.FormHelperText>}
                    </material_1.FormControl>)}/>

            <react_hook_form_1.Controller name="programmi" control={control} render={({ field }) => (<material_1.FormControl variant="outlined" fullWidth margin="normal" error={!!errors.programmi}>
                        <material_1.InputLabel id="programmi-label">Programmi</material_1.InputLabel>
                        <material_1.Select labelId="programmi-label" label="Programmi" {...field} value={field.value || ""}>
                            {programmi.map((p) => (<material_1.MenuItem key={p.id} value={p.id}> {/* Invia l'ID del programma */}
                                    {p.titolo}
                                </material_1.MenuItem>))}
                        </material_1.Select>
                        {errors.programmi && <material_1.FormHelperText>{errors.programmi.message}</material_1.FormHelperText>}
                    </material_1.FormControl>)}/>

            <react_hook_form_1.Controller name="oreTotali" control={control} render={({ field }) => (<material_1.FormControl variant="outlined" fullWidth margin="normal" error={!!errors.oreTotali}>
                        <material_1.InputLabel>Ore totali</material_1.InputLabel>
                        <material_1.OutlinedInput label="Ore totali" type="number" // Imposta il tipo di input a number
         {...field} value={field.value === 0 ? "" : field.value} // Mostra stringa vuota per 0
         onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}/>
                        {errors.oreTotali && <material_1.FormHelperText>{errors.oreTotali.message}</material_1.FormHelperText>}
                    </material_1.FormControl>)}/>

            <react_hook_form_1.Controller name="dataInizio" control={control} render={({ field }) => (<material_1.FormControl fullWidth margin="normal" error={!!errors.dataInizio}>
                        <DatePicker_1.DatePicker label="Data Inizio" value={field.value ? (0, dayjs_1.default)(field.value) : null} onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")} slotProps={{
                textField: {
                    fullWidth: true,
                    variant: "outlined",
                    error: !!errors.dataInizio
                }
            }}/>
                        {errors.dataInizio && <material_1.FormHelperText>{errors.dataInizio.message}</material_1.FormHelperText>}
                    </material_1.FormControl>)}/>

            {/* DATA FINE CORSO */}
            <react_hook_form_1.Controller name="dataFine" control={control} render={({ field }) => (<material_1.FormControl fullWidth margin="normal" error={!!errors.dataFine}>
                        <DatePicker_1.DatePicker label="Data Fine" value={field.value ? (0, dayjs_1.default)(field.value) : null} onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")} slotProps={{
                textField: {
                    fullWidth: true,
                    variant: "outlined",
                    error: !!errors.dataFine
                }
            }}/>
                        {errors.dataFine && <material_1.FormHelperText>{errors.dataFine.message}</material_1.FormHelperText>}
                    </material_1.FormControl>)}/>

            {/* NOTE */}
            <react_hook_form_1.Controller name="note" control={control} render={({ field }) => (<material_1.FormControl fullWidth margin="normal" error={!!errors.note}>
                        <material_1.TextField label="Note" placeholder="Inserisci eventuali dettagli aggiuntivi..." multiline rows={4} variant="outlined" {...field}/>
                        {errors.note && <material_1.FormHelperText>{errors.note.message}</material_1.FormHelperText>}
                    </material_1.FormControl>)}/>
        </material_1.Box>
        </LocalizationProvider_1.LocalizationProvider>);
}
