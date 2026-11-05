'use client'

import EmptyState from "@/components/EmptyState";
import AddMaterialeModal from "@/components/Materiali/AddMaterialeModal";
import DelayedLoading from "@/components/DelayedLoading";
import { API_ENDPOINTS } from "@/lib/api";
import { fetcher } from "@/lib/swr-config";
import { FolderOffOutlined } from "@mui/icons-material";
import { Container, Box, Typography, Alert, Button } from "@mui/material";
import { Materiale } from "@progetto/shared/validation/types";
import useSWR from "swr";
import MaterialeCard from "@/components/Materiali/MaterialeCard";

export default function Materiali() {
    const { data: materiali, isLoading, error, mutate } =
        useSWR<Materiale[]>(API_ENDPOINTS.materiali, fetcher);

    if (isLoading) return <DelayedLoading />;

    return (
        <Container>
            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                }}>
                    <Typography variant="h4">Materiali</Typography>
                    <AddMaterialeModal onMaterialeAdded={() => mutate()} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Gestione e caricamento del materiale formativo.
                </Typography>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 4 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => mutate()}>
                            Riprova
                        </Button>
                    }
                >
                    {error.message}
                </Alert>
            )}

            {!error && (!materiali || materiali.length === 0) ? (
                <EmptyState
                    icon={FolderOffOutlined}
                    title="Nessun materiale trovato"
                    description="Inizia aggiungendo materiale"
                />
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                        },
                    }}
                >
                    {materiali?.map((m) => (
                        <MaterialeCard materiale={m} key={m.url} />
                    ))}
                </Box>
            )}
        </Container>
    );
}