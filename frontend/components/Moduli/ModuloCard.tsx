"use client";

import React, { useState } from "react";
import { Card, CardContent, Typography, Box, Divider, Button } from "@mui/material";
import ManageMaterialiModal from "./ManageMaterialiModal";
import EditModuloModal from "./EditModuloModal"; // Importa il modal di modifica
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type Modulo = {
    id: number;
    titolo: string;
    ore: number; // Modificato da n_ore a ore per coerenza con EditModuloModal
    descrizione: string; // Aggiunto per coerenza con EditModuloModal
}

interface ModuloCardProps {
    modulo: Modulo;
    onModuloUpdated: () => void; // Callback per aggiornare la lista nel componente padre
    onDeleteModulo: (moduloId: number) => void; // Callback per eliminare il modulo
}

export default function ModuloCard({ modulo, onModuloUpdated, onDeleteModulo }: ModuloCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                    {modulo.titolo}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Ore:</strong> {modulo.ore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Descrizione:</strong> {modulo.descrizione || "N/A"}
                    </Typography>
                </Box>

                <Divider sx={{ my: 1.5, mt: 'auto' }} />
                
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <ManageMaterialiModal modulo={modulo} />
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditModalOpen(true)} // Apre il modal di modifica
                    >
                        Modifica
                    </Button>
                    <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => onDeleteModulo(modulo.id)}>
                        Elimina
                    </Button>
                </Box>
            </CardContent>

            {/* Modal di Modifica Modulo */}
            {modulo && (
                <EditModuloModal
                    open={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    modulo={modulo}
                    onSaveSuccess={onModuloUpdated}
                />
            )}
        </Card>
    );
}