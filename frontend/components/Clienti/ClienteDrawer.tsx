import {
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    Link,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { ReactNode } from "react";
import { ClienteWithRelations } from "@progetto/shared/validation/types";

type Sede = ClienteWithRelations["sedi"][number];
type Contatto = Sede["contatti"][number];

interface ClienteDrawerProps {
    open: boolean;
    onClose: () => void;
    cliente?: ClienteWithRelations;
}

// Riga con icona e testo, usata per email e telefono
function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ display: "flex", color: "text.secondary", "& svg": { fontSize: 18 } }}>
                {icon}
            </Box>
            <Typography variant="body2" component="div">
                {children}
            </Typography>
        </Stack>
    );
}

function ContattoItem({ contatto }: { contatto: Contatto }) {
    return (
        <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={600}>
                {contatto.nome}
            </Typography>

            {contatto.email && (
                <InfoRow icon={<EmailOutlinedIcon />}>
                    <Link href={`mailto:${contatto.email}`} underline="hover" color="inherit">
                        {contatto.email}
                    </Link>
                </InfoRow>
            )}

            {contatto.telefono && (
                <InfoRow icon={<PhoneOutlinedIcon />}>
                    <Link href={`tel:${contatto.telefono}`} underline="hover" color="inherit">
                        {contatto.telefono}
                    </Link>
                </InfoRow>
            )}
        </Stack>
    );
}

function SedeCard({ sede }: { sede: Sede }) {
    const via = [sede.indirizzo, sede.civico].filter(Boolean).join(", ");
    const localita = [sede.cap, sede.citta].filter(Boolean).join(" ")
        + (sede.provincia ? ` (${sede.provincia})` : "");

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            {/* Intestazione sede */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnOutlinedIcon fontSize="small" color="action" />
                    <Typography fontWeight={600}>
                        {sede.nome || "Sede"}
                    </Typography>
                </Stack>

                {sede.tipo && (
                    <Chip
                        size="small"
                        variant="outlined"
                        label={String(sede.tipo).toLowerCase()}
                        sx={{ textTransform: "capitalize" }}
                    />
                )}
            </Stack>

            {/* Indirizzo */}
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, pl: 3.5 }}
            >
                {via}
                <br />
                {localita}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Contatti */}
            <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: "block", mb: 1, lineHeight: 1.5 }}
            >
                Contatti ({sede.contatti.length})
            </Typography>

            {sede.contatti.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    Nessun contatto associato.
                </Typography>
            ) : (
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                    {sede.contatti.map(contatto => (
                        <ContattoItem key={contatto.id} contatto={contatto} />
                    ))}
                </Stack>
            )}
        </Paper>
    );
}

export default function ClienteDrawer({
    open,
    onClose,
    cliente
}: ClienteDrawerProps) {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                "& .MuiDrawer-paper": {
                    width: { xs: "100%", sm: 480 },
                    display: "flex",
                    flexDirection: "column"
                }
            }}
        >
            {cliente && (
                <>
                    {/* Header fisso */}
                    <Box sx={{ px: 3, py: 2.5, borderBottom: 1, borderColor: "divider" }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            spacing={2}
                        >
                            <Box>
                                <Typography variant="h5" fontWeight={600}>
                                    {cliente.ragione_sociale}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    P.IVA {cliente.partita_iva}
                                </Typography>
                            </Box>

                            <Button
                                onClick={onClose}
                                size="small"
                                aria-label="Chiudi dettagli cliente"
                            >
                                <CloseIcon />
                            </Button>
                        </Stack>
                    </Box>

                    {/* Contenuto scorrevole */}
                    <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight={600}>
                                Sedi
                            </Typography>
                            <Chip size="small" label={cliente.sedi.length} />
                        </Stack>

                        {cliente.sedi.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Nessuna sede associata a questo cliente.
                            </Typography>
                        ) : (
                            <Stack spacing={2}>
                                {cliente.sedi.map(sede => (
                                    <SedeCard key={sede.id} sede={sede} />
                                ))}
                            </Stack>
                        )}
                    </Box>
                </>
            )}
        </Drawer>
    );
}