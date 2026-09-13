"use client";
import { Box, Button, Card, CardContent, Divider, Typography } from "@mui/material";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditAulaModal from "./EditAulaModal";
import { Aula } from "@shared/validation/types";

interface AulaCardProps {
    aula : Aula,
    onAulaUpdated : () => void,
    onDeleteAula : ( aulaId : number ) => void
}

export default function AulaCard( { aula, onAulaUpdated, onDeleteAula }  : AulaCardProps){
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom color="primary">
          {aula.nome}
        </Typography>

        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {"Capienza: " + (aula.capienza || "N/A")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {"Descrizione: " + (aula.descrizione || "N/A")}
          </Typography>
        </Box>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setIsEditModalOpen(true)} // Apre il modal di modifica
            >
              Modifica
            </Button>
            <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => onDeleteAula(aula.id)}>
              Elimina
            </Button>
          </Box>
        </Box>
      </CardContent>

      {/* Modal di Modifica Sede */}
      {aula && (
        <EditAulaModal
          key={aula.id}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          aula={aula}
          onSaveSuccess={onAulaUpdated}
        />
      )}
    </Card>
  );
}