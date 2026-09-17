import MyStepper from "@/components/Stepper/MyStepper";
import { Box, Typography, Container, Paper } from "@mui/material";
import { API_ENDPOINTS } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";

async function getSedi() {
    const res = await fetch(`${API_BASE_URL}/sedi`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Errore durante il recupero delle sedi: ${res.statusText}`);
    }
    return res.json();
}

async function getProgrammi() {
    const res = await fetch(`${API_BASE_URL}/programmi`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Errore durante il recupero dei programmi: ${res.statusText}`);
    }
    return res.json();
}

async function getDocenti() {
    const url = `${API_BASE_URL}/docenti`;
    console.log("DEBUG: Tentativo di fetch su:", url); // Questo apparirà nel terminale di VS Code, non nel browser!
    
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        console.error(`DEBUG: Fallito con status ${res.status} per URL: ${url}`);
        throw new Error(`Errore durante il recupero dei docenti: ${res.statusText}`);
    }
    return res.json();
}

export default async function CreaCommessaPage() {
    // Recuperiamo i dati necessari per popolare le opzioni dello stepper
    const [sedi, programmi, docenti] = await Promise.all([
        getSedi(),
        getProgrammi(),
        getDocenti(),
    ]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Crea Nuova Commessa
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Inserisci i dettagli del corso, associa i docenti e genera automaticamente il calendario delle sessioni.
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <MyStepper sedi={sedi} programmi={programmi} docenti={docenti} />
            </Paper>
        </Container>
    );
}