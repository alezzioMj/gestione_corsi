import { Card, CardContent, Typography, Box, Divider, Button, Chip, CardActions } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Stack from "@mui/material/Stack";

import { Modulo } from "@progetto/shared/validation/modulo.schema";

import ManageMaterialiModal from "./ManageMaterialiModal";

interface ModuloCardProps {
    deleting: boolean;
    modulo: Modulo;
    onDeleteModulo: (moduloId: number) => void;
    openModal: (modulo: Modulo) => void;
}

export default function ModuloCard({ modulo, deleting, openModal, onDeleteModulo }: ModuloCardProps) {
    return (
        <Card sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
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
                </Stack>
            </CardContent>
            <CardActions>
                <ManageMaterialiModal modulo={modulo} />
                <Button
                    variant="outlined"
                    disabled={deleting}
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDeleteModulo(modulo.id)}
                >
                    Elimina
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => openModal(modulo)}
                >
                    Modifica
                </Button>
            </CardActions>
        </Card >
    );
}