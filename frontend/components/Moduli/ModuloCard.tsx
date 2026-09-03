"use client";

import React, { useState } from "react";
import { Card, CardContent, Typography, Box, Divider, Button, Chip } from "@mui/material";
import ManageMaterialiModal from "./ManageMaterialiModal";
import EditModuloModal from "./EditModuloModal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Stack from "@mui/material/Stack";

type Modulo = {
    id: number;
    titolo: string;
    competenza: "Teorica" | "Trasversale" | "Pratica";
    descrizione?: string;
    multiplo?: boolean; // <--- Aggiunto il campo al tipo
}

interface ModuloCardProps {
    modulo: Modulo;
    onModuloUpdated: () => void;
    onDeleteModulo: (moduloId: number) => void;
}

export default function ModuloCard({ modulo, onModuloUpdated, onDeleteModulo }: ModuloCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <Card sx={{width: "100%", height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                    {modulo.titolo}
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Descrizione:</strong> {modulo.descrizione || "N/A"}
                    </Typography>

                    {/* Badge visivo per indicare se il modulo è multiplo o singolo */}
                    <Box sx={{ mt: 1 }}>
                        <Chip
                            label={modulo.multiplo ? "Multiplo" : "Singolo"}
                            color={modulo.multiplo ? "secondary" : "default"}
                            size="small"
                            variant={modulo.multiplo ? "filled" : "outlined"}
                        />
                    </Box>
                </Box>

                <Divider sx={{ my: 1.5, mt: 'auto' }} />

                <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: 'wrap', marginTop: 2 }}
                >
                    <ManageMaterialiModal modulo={modulo} />
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Modifica
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => onDeleteModulo(modulo.id)}
                    >
                        Elimina
                    </Button>
                </Stack>
            </CardContent>

            {/* Modal di Modifica Modulo */}
            {
                modulo && (
                    <EditModuloModal
                        open={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        modulo={modulo}
                        onSaveSuccess={onModuloUpdated}
                    />
                )
            }
        </Card >
    );
}