"use client";

import React from "react";
import { Card, CardContent, Typography, Box, Divider, Button } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import Link from "next/link";
import type { Sede } from "@progetto/shared/validation/sede.schema";
import CardActionsBar from "@/components/common/CardActionsBar";

interface SedeCardProps {
    sede: Sede;
    onEdit: (sede: Sede) => void;
    onDelete: (sedeId: number) => void;
}

export default function SedeCard({ sede, onEdit, onDelete }: SedeCardProps) {
    const openMap = () => {
        const query = encodeURIComponent(`${sede.indirizzo} ${sede.civico}, ${sede.citta} ${sede.provincia}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
    };

    return (
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom color="primary">
                    {sede.nome}
                </Typography>
                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                        {sede.indirizzo} {sede.civico}, {sede.cap} {sede.citta} ({sede.provincia})
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                        {sede.descrizione || "N/A"}
                    </Typography>
                </Box>

                <CardActionsBar onEdit={() => onEdit(sede)} onDelete={() => onDelete(sede.id)}>
                    <Button size="small" onClick={openMap}>Mappa</Button>
                    <Button size="small" variant="outlined" component={Link} href={`/sedi/${sede.id}/aule`}>
                        Aule
                    </Button>
                </CardActionsBar>
            </CardContent>
        </Card>
    );
}