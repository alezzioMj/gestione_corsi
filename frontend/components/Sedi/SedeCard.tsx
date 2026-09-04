"use client";

import React, { useState } from "react";
import { Card, CardContent, Typography, Box, Divider, Button } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import { Sede } from "../../validation/types";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditSedeModal from "./EditSedeModal"; // Importa il modal di modifica

interface SedeCardProps {
  sede: Sede;
  onSedeUpdated: () => void; // Callback per aggiornare la lista nel componente padre
  onDeleteSede: (sedeId: number) => void; // Callback per eliminare la sede
}

export default function SedeCard({ sede, onSedeUpdated, onDeleteSede }: SedeCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom color="primary">
          {sede.nome}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {sede.citta}, {sede.provincia}, - CAP:{sede.cap} {sede.indirizzo} - {sede.civico}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PhoneIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {sede.descrizione || "N/A"}
          </Typography>
        </Box>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              const query = encodeURIComponent(`${sede.indirizzo} ${sede.civico}, ${sede.citta} ${sede.provincia}`);
              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
            }}
          >
            Mappa
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setIsEditModalOpen(true)} // Apre il modal di modifica
            >
              Modifica
            </Button>
            <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => onDeleteSede(sede.id)}>
              Elimina
            </Button>
          </Box>
          <Button
            variant="outlined"
            size="small"
            component={Link}
            href={`/sedi/${sede.id}/aule`}
          >
            Aule
          </Button>
        </Box>
      </CardContent>

      {/* Modal di Modifica Sede */}
      {sede && (
        <EditSedeModal
          key={sede.id}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          sede={sede}
          onSaveSuccess={onSedeUpdated}
        />
      )}
    </Card>
  );

}