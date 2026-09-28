"use client";

import React, { useState } from "react";
import { Card, CardContent, Typography, Box, Divider, Avatar, Button } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import { Docente } from "@progetto/shared/validation/types";
import AddModuloModal from "./AddModuloModal";
import EditDocenteModal from "./EditDocenteModal"; // Importa il componente EditDocenteModal
import EditIcon from "@mui/icons-material/Edit"; // Importa l'icona di modifica
import DeleteIcon from '@mui/icons-material/Delete'; // Importa l'icona di eliminazione

interface DocenteCardProps {
  docente: Docente;
  onDocenteUpdated: () => void; // Callback per aggiornare la lista dei docenti nel componente padre
  onDeleteDocente: (codice_fiscale: string) => void; // Callback per gestire l'eliminazione
}

export default function DocenteCard({ docente, onDocenteUpdated, onDeleteDocente }: DocenteCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    onDocenteUpdated(); // Aggiorna la lista dei docenti nel componente padre
    handleCloseEditModal();
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {docente.nome[0]}{docente.cognome[0]}
          </Avatar>
          <Typography variant="h6" component="div" color="primary">
            {docente.nome} {docente.cognome}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <BadgeIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            CF: {docente.codice_fiscale}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <EmailIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {docente.mail || "Email non disponibile"}
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <AddModuloModal docente={docente} />
          <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={handleOpenEditModal}>
            Modifica
          </Button>
          <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => onDeleteDocente(docente.codice_fiscale)}>
            Elimina
          </Button>
        </Box>
      </CardContent>

      {docente && ( // Renderizza il modale solo se il docente è presente
        <EditDocenteModal
          key={docente.codice_fiscale}
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          docente={docente}
          onSaveSuccess={handleEditSuccess}
        />
      )}
    </Card>
  );
}