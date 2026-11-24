"use client";

import React, { useState } from "react";
import { Card, CardContent, Typography, Box, Divider, Avatar, Button } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import type { Docente } from "@progetto/shared/validation/docente.schema";
import CardActionsBar from "../common/CardActionsBar";
import ModuliAssociationDialog from "../common/ModuliAssociationDialog";

interface DocenteCardProps {
  docente: Docente;
  onEdit: (docente: Docente) => void;
  onDelete: (docente_cf: string) => void;
}

export default function DocenteCard({ docente, onEdit, onDelete }: DocenteCardProps) {
  const [moduliOpen, setModuliOpen] = useState(false);

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
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

        <CardActionsBar
          onEdit={() => onEdit(docente)}
          onDelete={() => onDelete(docente.codice_fiscale)}
        >
          <Button variant="contained" size="small" onClick={() => setModuliOpen(true)}>
            Associa moduli
          </Button>
        </CardActionsBar>
      </CardContent>

      <ModuliAssociationDialog
        open={moduliOpen}
        onClose={() => setModuliOpen(false)}
        onSuccess={() => setModuliOpen(false)}
        title={`Moduli di ${docente.nome} ${docente.cognome}`}
        associationsEndpoint={`/docenti/${docente.codice_fiscale}/moduli`}
        saveEndpoint={`/docenti/${docente.codice_fiscale}/moduli_bulk`}
        extractIds={(d: { modulo_id: number }[]) => d.map((x) => x.modulo_id)}
      />
    </Card>
  );
}