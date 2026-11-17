
import {
    Card,
    CardContent,
    CardActions,
    Stack,
    Grid,
    Typography,
    Chip,
    IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Commessa } from "@progetto/shared/validation/commessa.schema";

interface CommessaCardProps {
    commessa: Commessa & {
        cliente?: {
            ragione_sociale: string;
        } | null;
    };
    onEdit: (commessa: CommessaCardProps["commessa"]) => void;
    onDelete: (commessa: CommessaCardProps["commessa"]) => void;
}

const STATO_CONFIG = {
    APERTA: { label: "Aperta", color: "success" },
    IN_CORSO: { label: "In corso", color: "info" },
    CHIUSA: { label: "Chiusa", color: "default" },
    ANNULLATA: { label: "Annullata", color: "error" },
} as const;

export default function CommessaCard({
    commessa,
    onEdit,
    onDelete,
}: CommessaCardProps) {
    const stato = STATO_CONFIG[commessa.stato as keyof typeof STATO_CONFIG];

    return (
        <Card variant="outlined" sx={{ width: "100%" }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack
                        sx={{
                            direction: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <Typography>
                            {commessa.codice_commessa}
                        </Typography>

                        <Chip
                            label={stato?.label ?? commessa.stato}
                            color={stato?.color ?? "default"}
                            size="small"
                        />
                    </Stack>
                    {commessa.descrizione && (
                        <>
                            <Typography variant="caption">
                                Descrizione
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {commessa.descrizione}
                            </Typography>
                        </>

                    )}

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                                Cliente
                            </Typography>
                            <Typography>
                                {commessa.cliente?.ragione_sociale ?? "Non assegnato"}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                                Codice FT
                            </Typography>
                            <Typography variant="body2">
                                {commessa.codice_ft || "—"}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                                Codice RLOM
                            </Typography>
                            <Typography variant="body2">
                                {commessa.codice_rlom || "—"}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                                Scadenza
                            </Typography>
                            <Typography>
                                {commessa.scadenza
                                    ? new Date(commessa.scadenza).toLocaleDateString("it-IT")
                                    : "Non definita"}
                            </Typography>
                        </Grid>
                    </Grid>
                </Stack>
            </CardContent>

            <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                <IconButton
                    onClick={() => onEdit(commessa)}
                    size="small"
                    aria-label="Modifica commessa"
                >
                    <EditIcon />
                </IconButton>

                <IconButton
                    onClick={() => onDelete(commessa)}
                    size="small"
                    color="error"
                    aria-label="Elimina commessa"
                >
                    <DeleteIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
}
