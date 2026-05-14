"use client";

import React, { useState } from "react";
import { Card, CardContent, Typography, Box, Divider, Chip, Button } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { ProgrammaConModuli } from "../Stepper/MyStepper";
import AddModuloProgrammaModal from "./AddModuloProgrammaModal";
import EditProgrammaModal from "./EditProgrammaModal"; // Importa il modal di modifica
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface ProgrammaCardProps {
  programma: ProgrammaConModuli;
  onProgrammaUpdated: () => void; // Callback per aggiornare la lista nel componente padre
  onDeleteProgramma: (programmaId: number) => void; // Callback per eliminare il programma
}

export default function ProgrammaCard({ programma, onProgrammaUpdated, onDeleteProgramma }: ProgrammaCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h6" component="div" color="primary">
            {programma.titolo}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Durata Totale: {programma.durata_totale} ore
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Ore Pratiche: {programma.ore_pratiche}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Ore Teoriche: {programma.ore_teoriche}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Ore Trasversali: {programma.ore_trasversali}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Carosello Moduli Orizzontale */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <MenuBookIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" >Moduli associati:</Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: '5px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
          }}>
            {programma.programma_modulo && programma.programma_modulo.length > 0 ? (
              programma.programma_modulo.map((pm) => (
                <Chip
                  key={pm.modulo_id}
                  label={pm.modulo?.titolo || "Senza Titolo"}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{ flexShrink: 0 }}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">Nessun modulo associato</Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 'auto', display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <AddModuloProgrammaModal programma={programma} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setIsEditModalOpen(true)} // Apre il modal di modifica
          >
            Modifica
          </Button>
          <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => onDeleteProgramma(programma.id)}>
            Elimina
          </Button>
        </Box>
      </CardContent>
      {programma && (
        <EditProgrammaModal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} programma={programma} onSaveSuccess={onProgrammaUpdated} />
      )}
    </Card>
  );
}