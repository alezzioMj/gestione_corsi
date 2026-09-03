"use client";

import {
    Box,
    Typography,
    Container,
    Button,
    Paper,
    Alert,
} from "@mui/material";
import ProgrammaCard from "@/components/Programmi/ProgrammaCard";
import { ProgrammaConModuli } from "@/components/Stepper/MyStepper";
import { API_BASE_URL } from "@/lib/config";
import DelayedLoading from "@/components/DelayedLoading";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import AddProgrammaModal from "@/components/Programmi/AddProgrammaModal";

export default function ProgrammiPage() {
    const { data: programmi, isLoading, error, mutate } = useSWR(`${API_BASE_URL}/programmi`, fetcher);

    const handleDeleteProgramma = async (programmaId: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo programma?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/programmi/${programmaId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione del programma: ${res.statusText}`);
            }
            mutate();
            alert("Programma eliminato con successo!");
        } catch (error: unknown) {
            alert(`Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
            console.error("Errore nell'eliminazione del programma:", error);
        }
    };

    return (
        <Container sx={{ py: 2 }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                mb: 4
            }}>
                <Typography variant="h4" gutterBottom>Programmi Formativi</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione dei programmi didattici e dei moduli associati.
                </Typography>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <AddProgrammaModal onProgrammaAdded={() => mutate()} />
                </Box>
            </Box>
            {error && (
                <Alert severity="error" sx={{ mb: 4 }} action={<Button color="inherit" size="small" onClick={() => mutate}>Riprova</Button>}>
                    {error.message}
                </Alert>
            )}
            {isLoading ? (
                <DelayedLoading />
            ) : programmi.length === 0 ? (
                <Typography variant="h6" color="text.secondary">Nessun programma trovato. Inizia aggiungendo un nuovo programma!</Typography>
            ) : (
                <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: 3 }}>
                    {programmi.map((p: ProgrammaConModuli) => (
                        <Paper key={p.id} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <ProgrammaCard
                                programma={p}
                                onProgrammaUpdated={() => mutate()}
                                onDeleteProgramma={handleDeleteProgramma}
                            />
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
    );
}