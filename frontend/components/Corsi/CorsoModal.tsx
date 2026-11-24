"use client";

import React from "react";
import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { EntityDialog } from "@/components/common/EntityFormShell";
import { formatRange, formatTime, visibleRows, type CorsoItem } from "./Corso";

interface CorsoInfoDialogProps {
    open: boolean;
    corso: CorsoItem | null;
    onClose: () => void;
}

export default function CorsoInfoDialog({ open, corso, onClose }: CorsoInfoDialogProps) {
    return (
        <EntityDialog open={open} onClose={onClose} size="sm">
            {corso && <CorsoInfo corso={corso} onClose={onClose} />}
        </EntityDialog>
    );
}

function CorsoInfo({ corso: c, onClose }: { corso: CorsoItem; onClose: () => void }) {
    const rows = visibleRows([
        ["ID", c.id],
        ["Cliente", c.commessa?.cliente?.ragione_sociale],
        ["Programma", c.programma?.titolo],
        ["Ore totali", c.n_ore],
        ["Periodo", formatRange(c.inizio, c.fine)],
        ["Mattina", `${formatTime(c.mattina_inizio)} – ${formatTime(c.mattina_fine)}`],
        ["Pomeriggio", `${formatTime(c.pomeriggio_inizio)} – ${formatTime(c.pomeriggio_fine)}`],
        ["Docenti", c.corso_docente.map((cd) => `${cd.docente.nome} ${cd.docente.cognome}`).join(", ")],
        ["Sedi", c.corso_sede.map((cs) => cs.sede.nome).join(", ")],
        ["Descrizione", c.descrizione],
    ]);

    return (
        <>
            <DialogTitle>Dettagli Corso</DialogTitle>
            <DialogContent dividers>
                <Typography variant="h6" gutterBottom>{c.nome}</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {rows.map(([label, value]) => (
                        <Typography key={label} variant="body1">
                            <Box component="span" sx={{ color: "text.secondary" }}>{label}: </Box>
                            {value}
                        </Typography>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose}>Chiudi</Button>
            </DialogActions>
        </>
    );
}