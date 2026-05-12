"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StepReview;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const react_hook_form_1 = require("react-hook-form");
const giorniLabels = {
    1: "Lunedì", 2: "Martedì", 3: "Mercoledì", 4: "Giovedì", 5: "Venerdì", 6: "Sabato", 7: "Domenica"
};
function StepReview({ docenti }) {
    const { getValues } = (0, react_hook_form_1.useFormContext)();
    const data = getValues();
    const getDocenteNome = (cf) => {
        const d = docenti.find(doc => doc.codice_fiscale === cf);
        return d ? `${d.nome} ${d.cognome}` : cf;
    };
    return (<material_1.Box sx={{ p: 2 }}>
            <material_1.Typography variant="h6" gutterBottom color="primary">Riepilogo Configurazione Corso</material_1.Typography>
            <material_1.Paper variant="outlined" sx={{ p: 3, backgroundColor: 'action.hover' }}>
                <material_1.Grid container spacing={4}>
                    {/* SEZIONE ANAGRAFICA */} 
                    <material_1.Grid item xs={12} md={6}>
                        <material_1.Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            Dati Generali
                            </material_1.Typography>
                        <material_1.List dense>
                            <material_1.ListItem><material_1.ListItemText primary="Nome Corso" secondary={data.nomeCorso}/></material_1.ListItem>
                            <material_1.ListItem><material_1.ListItemText primary="Cliente" secondary={data.cliente}/></material_1.ListItem>
                            <material_1.ListItem><material_1.ListItemText primary="Programma" secondary={data.programmi}/></material_1.ListItem>
                            <material_1.ListItem><material_1.ListItemText primary="Sedi" secondary={Array.isArray(data.sedi) ? data.sedi.join(", ") : data.sedi}/></material_1.ListItem>
                            <material_1.ListItem><material_1.ListItemText primary="Ore Totali" secondary={`${data.oreTotali}h`}/></material_1.ListItem>
                            <material_1.ListItem><material_1.ListItemText primary="Periodo" secondary={`${data.dataInizio} / ${data.dataFine}`}/></material_1.ListItem>
                        </material_1.List>
                    </material_1.Grid>

                    {/* SEZIONE PIANIFICAZIONE */} 
                    <material_1.Grid item xs={12} md={6}>
                        <material_1.Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Docenti e Orari</material_1.Typography>
                        <material_1.List dense>
                            <material_1.ListItem>
                                <material_1.ListItemText primary="Docenti Assegnati" secondary={data.docenti.map(getDocenteNome).join(", ")}/>
                            </material_1.ListItem>
                            <material_1.ListItem>
                                <material_1.ListItemText primary="Giorni di Lezione" secondary={data.giorni.sort().map(g => giorniLabels[g]).join(", ")}/>
                            </material_1.ListItem>
                            <material_1.ListItem>
                                <material_1.ListItemText primary="Orario Mattina" secondary={`${data.mattina_inizio} - ${data.mattina_fine}`}/>
                            </material_1.ListItem>
                            <material_1.ListItem>
                                <material_1.ListItemText primary="Orario Pomeriggio" secondary={`${data.pomeriggio_inizio} - ${data.pomeriggio_fine}`}/>
                            </material_1.ListItem>
                        </material_1.List>
                    </material_1.Grid>

                    {data.note && (<material_1.Grid item xs={12}>
                            <material_1.Divider sx={{ mb: 1 }}/>
                            <material_1.Typography variant="caption" color="text.secondary">Note aggiuntive:</material_1.Typography>
                            <material_1.Typography variant="body2">{data.note}</material_1.Typography>
                        </material_1.Grid>)}
                </material_1.Grid>
            </material_1.Paper>
        </material_1.Box>);
}
