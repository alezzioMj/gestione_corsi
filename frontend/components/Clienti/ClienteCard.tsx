import {
    Card,
    CardContent,
    Box,
    Typography,
    Divider,
    Stack,
    Button
} from "@mui/material";

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PeopleOutlineIcon from "@mui/icons-material/Person2Outlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { ClienteWithRelations } from "@progetto/shared/validation/types";

interface ClienteCardProps {
    cliente: ClienteWithRelations;
    onEdit: () => void;
    onDelete: () => void;
    onClick: () => void;
}

export default function ClienteCard({
    cliente,
    onEdit,
    onDelete,
    onClick
}: ClienteCardProps) {

    const numeroSedi = cliente.sedi.length;

    const numeroContatti = cliente.sedi.reduce(
        (totale, sede) => totale + sede.contatti.length,
        0
    );

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-2px)",
                    boxShadow: 2
                }
            }}
            onClick={onClick}
        >
            <CardContent>
                <Stack spacing={2}>

                    {/* Intestazione */}
                    <Stack
                        sx={{ direction: "row", alignItems: "center" }}
                        spacing={1.5}
                    >
                        <BusinessOutlinedIcon
                            color="primary"
                            fontSize="large"
                        />

                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600 }}>
                                {cliente.ragione_sociale}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                P. IVA: {cliente.partita_iva}
                            </Typography>
                        </Box>

                        <ChevronRightIcon color="action" />
                    </Stack>

                    <Divider />

                    {/* Informazioni */}
                    <Stack
                        sx={{
                            direction: "row",
                            alignItems: "center",
                            justifyContent: "space-around"
                        }}

                    >
                        <Stack direction="row" spacing={1}>
                            <LocationOnOutlinedIcon color="action" />

                            <Box>
                                <Typography variant="h6">
                                    {numeroSedi}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Sedi
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <PeopleOutlineIcon color="action" />

                            <Box>
                                <Typography variant="h6">
                                    {numeroContatti}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Contatti
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>

                    <Divider />

                    {/* Azioni */}
                    <Stack
                        sx={{
                            direction: "row",
                            justifyContent: "flex-end"
                        }}
                    >
                        <Button
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        >
                            <EditOutlinedIcon />
                        </Button>

                        <Button
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <DeleteOutlineIcon />
                        </Button>
                    </Stack>

                </Stack>
            </CardContent>
        </Card>
    );
}