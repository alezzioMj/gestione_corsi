"use client";

import { useState } from "react";
import { Card, CardContent, Typography, Box, Divider, Chip, Button } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import type { ProgrammaWithRelations } from "@progetto/shared/validation/programma.schema";
import CardActionsBar from "../common/CardActionsBar";
import ModuliAssociationDialog from "../common/ModuliAssociationDialog";

type ProgrammaCardData = ProgrammaWithRelations<"corso" | "programma_modulo">;

interface ProgrammaCardProps {
  programma: ProgrammaCardData;
  onEdit: (programma: ProgrammaCardData) => void;
  onDelete: (programmaId: number) => void;
  onModuliUpdated: () => void;
}

export default function ProgrammaCard({ programma, onEdit, onDelete, onModuliUpdated }: ProgrammaCardProps) {
  const [moduliOpen, setModuliOpen] = useState(false);

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Typography variant="h6" component="div" color="primary" sx={{ mb: 2 }}>
          {programma.titolo}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold", mb: 1 }}>
          Durata Totale: {programma.durata_totale} ore
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Ore Pratiche: {programma.ore_pratiche}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Ore Teoriche: {programma.ore_teoriche}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Ore Trasversali: {programma.ore_trasversali}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <MenuBookIcon fontSize="small" color="action" />
            <Typography variant="subtitle2">Moduli associati:</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              pb: 1,
              "&::-webkit-scrollbar": { height: "5px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(0,0,0,0.1)", borderRadius: "10px" },
            }}
          >
            {programma.programma_modulo.length > 0 ? (
              programma.programma_modulo.map((pm) => (
                <Chip
                  key={pm.id}
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

        <CardActionsBar onEdit={() => onEdit(programma)} onDelete={() => onDelete(programma.id)}>
          <Button variant="contained" size="small" onClick={() => setModuliOpen(true)}>
            Configura Moduli
          </Button>
        </CardActionsBar>
      </CardContent>

      <ModuliAssociationDialog
        open={moduliOpen}
        onClose={() => setModuliOpen(false)}
        onSuccess={() => {
          setModuliOpen(false);
          onModuliUpdated();
        }}
        title={`Configura moduli: ${programma.titolo}`}
        associationsEndpoint={`/programmi/${programma.id}/moduli`}
        saveEndpoint={`/programmi/${programma.id}/moduli_bulk`}
        extractIds={(d) => d.map((pm) => pm.modulo_id)}
        sortable
      />
    </Card>
  );
}