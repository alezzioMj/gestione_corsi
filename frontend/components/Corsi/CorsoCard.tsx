"use client";

import React from "react";
import Link from "next/link";
import { Box, Button, Card, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CardActionsBar from "@/components/common/CardActionsBar";
import { formatRange, formatTime, visibleRows, type CorsoItem } from "./Corso";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";

interface CorsoCardProps {
    corso: CorsoItem;
    onInfo: (corso: CorsoItem) => void;
    onDelete: (corsoId: number) => void;
    onBozze: (corso: CorsoItem) => void;
}

export default function CorsoCard({ corso, onInfo, onDelete, onBozze }: CorsoCardProps) {
    const fields = visibleRows([
        ["Cliente", corso.commessa?.cliente?.ragione_sociale],
        ["Programma", corso.programma?.titolo],
        ["Periodo", formatRange(corso.inizio, corso.fine)],
        corso.n_ore != null && ["Ore totali", corso.n_ore],
        ["Mattina", `${formatTime(corso.mattina_inizio)} – ${formatTime(corso.mattina_fine)}`],
        ["Pomeriggio", `${formatTime(corso.pomeriggio_inizio)} – ${formatTime(corso.pomeriggio_fine)}`],
        ["Docenti", corso.corso_docente.length],
        ["Sedi", corso.corso_sede.length],
    ]);

    return (
        <Card
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { md: "center" },
                justifyContent: "space-between",
                gap: 2,
                p: 2,
                boxShadow: 2,
            }}
        >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="h6" component="div" color="primary" noWrap sx={{ mb: 1.5 }}>
                    {corso.nome}
                </Typography>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                        gap: 2,
                    }}
                >
                    {fields.map(([label, value]) => (
                        <Box key={label}>
                            <Typography variant="caption" color="text.secondary" component="div">
                                {label}
                            </Typography>
                            <Typography variant="body2">{value ?? "—"}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box sx={{ flexShrink: 0 }}>
                <CardActionsBar onDelete={() => onDelete(corso.id)}>
                    <Button variant="outlined" size="small" startIcon={<InfoIcon />} onClick={() => onInfo(corso)}>
                        Info
                    </Button>
                    <Button variant="outlined" size="small" component={Link} href="/calendario">
                        Visualizza Sessioni
                    </Button>
                    {(corso.bozze_count ?? 0) > 0 && (
                        <Button
                            variant="outlined" color="warning" size="small"
                            startIcon={<EditCalendarIcon />}
                            onClick={() => onBozze(corso)}
                        >
                            Bozze sessioni ({corso.bozze_count})
                        </Button>
                    )}
                </CardActionsBar>
            </Box>
        </Card>
    );
}