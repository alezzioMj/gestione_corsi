"use client";

import React from "react";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import type { Aula } from "@progetto/shared/validation/aula.schema";
import CardActionsBar from "@/components/common/CardActionsBar";

interface AulaCardProps {
  aula: Aula;
  onEdit: (aula: Aula) => void;
  onDelete: (aulaId: number) => void;
}

export default function AulaCard({ aula, onEdit, onDelete }: AulaCardProps) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom color="primary">
          {aula.nome}
        </Typography>
        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Capienza: {aula.capienza || "N/A"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Descrizione: {aula.descrizione || "N/A"}
          </Typography>
        </Box>

        <CardActionsBar
          onEdit={() => onEdit(aula)}
          onDelete={() => onDelete(aula.id)}
        />
      </CardContent>
    </Card>
  );
}