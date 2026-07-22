"use client";

import React from "react";
import { Box, Typography, Grid, List, ListItem, ListItemText, Divider, Paper } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { FormType, DocenteConModuli, ProgrammaConModuli } from "./MyStepper";

const giorniLabels: Record<number, string> = {
    1: "Lunedì", 2: "Martedì", 3: "Mercoledì", 4: "Giovedì", 5: "Venerdì", 6: "Sabato", 7: "Domenica"
};

export default function StepReview({ docenti, programmi }: { docenti: DocenteConModuli[], programmi: ProgrammaConModuli[] }) {
    const { getValues } = useFormContext<FormType>();
    const data = getValues();

    const getDocenteNome = (cf: string) => {
        const d = docenti.find(doc => doc.codice_fiscale === cf);
        return d ? `${d.nome} ${d.cognome}` : cf;
    };

    const getProgrammaTitolo = (id: number) => {
        const p = programmi.find(prog => prog.id === id);
        return p ? p.titolo : `Programma #${id}`;
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">Riepilogo Configurazione Corso</Typography>
            <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'action.hover' }}>
                <Grid container spacing={4}>
                    {/* SEZIONE ANAGRAFICA */} 
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            Dati Generali
                            </Typography>
                        <List dense>
                            <ListItem><ListItemText primary="Nome Commessa" secondary={data.nome} /></ListItem>
                            <ListItem><ListItemText primary="Cliente" secondary={data.cliente} /></ListItem>
                            <ListItem><ListItemText primary="Programma" secondary={getProgrammaTitolo(data.programmi)} /></ListItem>
                            <ListItem><ListItemText primary="Sedi" secondary={Array.isArray(data.sedi) ? data.sedi.join(", ") : data.sedi} /></ListItem>
                            <ListItem><ListItemText primary="Ore Totali" secondary={`${data.oreTotali}h`} /></ListItem>
                            <ListItem><ListItemText primary="Periodo" secondary={`${data.dataInizio} / ${data.dataFine}`} /></ListItem>
                        </List>
                    </Grid>

                    {/* SEZIONE PIANIFICAZIONE */} 
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Docenti e Orari</Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    primary="Docenti Assegnati" 
                                    secondary={data.docenti.map(getDocenteNome).join(", ")} 
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="Giorni di Lezione" 
                                    secondary={data.giorni.sort().map(g => giorniLabels[g]).join(", ")} 
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="Orario Mattina" 
                                    secondary={`${data.mattina_inizio} - ${data.mattina_fine}`} 
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="Orario Pomeriggio" 
                                    secondary={`${data.pomeriggio_inizio} - ${data.pomeriggio_fine}`} 
                                />
                            </ListItem>
                        </List>
                    </Grid>

                    {data.note && (
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 1 }} />
                            <Typography variant="caption" color="text.secondary">Note aggiuntive:</Typography>
                            <Typography variant="body2">{data.note}</Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Box>
    );
}