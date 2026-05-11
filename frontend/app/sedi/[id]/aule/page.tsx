import { Box, Typography, Container, Paper, List, ListItem, ListItemText, Divider, Button } from "@mui/material";
import Link from "next/link";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from "react";
import AddAulaModal from "@/components/Aule/AddAulaModal";
import { API_BASE_URL } from "@/lib/config";

async function getSede(id: string) {
    // Questo endpoint include già l'elenco delle aule (sede.aula)
    const res = await fetch(`${API_BASE_URL}/sedi/${id}`, { cache: "no-store" });
    return res.ok ? res.json() : null;
}

export default async function AuleSedePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const sedeId = resolvedParams.id;

    if (!sedeId) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h6" color="error">ID Sede non fornito nell'URL.</Typography>
                <Link href="/sedi">Torna alla lista delle Sedi</Link>
            </Container>
        );
    }

    const sede = await getSede(sedeId);
    
    if (!sede) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h6" color="error">Sede con ID "{sedeId}" non trovata.</Typography>
                <Link href="/sedi">Torna alla lista delle Sedi</Link>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/sedi" style={{ textDecoration: 'none' }}>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />}>
                        Torna alle Sedi
                    </Button>
                </Link>
                <AddAulaModal sedeId={Number(sedeId)} />
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Aule - {sede.nome}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {sede.indirizzo}, {sede.citta} ({sede.provincia})
                </Typography>
            </Box>

            <Paper elevation={2}>
                <List>
                    {sede.aula && sede.aula.length > 0 ? (
                        sede.aula.map((a: any, index: number) => (
                            <React.Fragment key={a.id}>
                                <ListItem>
                                    <ListItemText 
                                        primary={a.nome} 
                                        secondary={`Capienza: ${a.capienza ?? 'N/D'} posti`} 
                                    />
                                </ListItem>
                                {index < sede.aula.length - 1 && <Divider />}
                            </React.Fragment>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="Nessuna aula configurata per questa sede." />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Container>
    );
}