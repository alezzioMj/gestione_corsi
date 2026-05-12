"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Container,
    Button,
    Paper,
    CircularProgress,
    Alert,
} from "@mui/material";
import ProgrammaCard from "@/components/Programmi/ProgrammaCard";
import AddProgrammaModal from "@/components/Programmi/AddProgrammaModal"; // Assumendo esista un modal per aggiungere programmi
import { ProgrammaConModuli } from "@/components/Stepper/MyStepper"; // Usa il tipo più completo
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

export default function ProgrammiPage() {
    const [programmi, setProgrammi] = useState<ProgrammaConModuli[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const router = useRouter();

    const fetchProgrammi = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/programmi`, { cache: "no-store" });
            if (!res.ok) {
                if (res.status === 404) {
                    console.warn("Nessun programma trovato.");
                    setProgrammi([]);
                } else {
                    throw new Error(`Errore ${res.status}: ${res.statusText}`);
                }
            } else {
                const data = await res.json();
                setProgrammi(data);
            }
        } catch (err: any) {
            console.error("Errore nel recupero dei programmi:", err);
            setFetchError(`Impossibile caricare i programmi: ${err.message || 'Errore di rete'}. Assicurati che il backend sia attivo.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgrammi();
    }, []);

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
            setProgrammi(prevProgrammi => prevProgrammi.filter(p => p.id !== programmaId));
            alert("Programma eliminato con successo!");
        } catch (error: any) {
            alert(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione del programma:", error);
        } finally {
            router.refresh(); // For Next.js to re-fetch server components
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Programmi Formativi</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione dei programmi didattici e dei moduli associati.
                </Typography>
                <Box sx={{ mb: 4 }}>
                    {/* Assumendo che esista un AddProgrammaModal simile a AddDocenteModal */}
                    {/* <AddProgrammaModal onProgrammaAdded={fetchProgrammi} /> */}
                    <Button variant="contained" onClick={() => alert("Implementa AddProgrammaModal")}>Aggiungi Programma</Button>
                </Box>
            </Box>
            {fetchError && (
                <Alert severity="error" sx={{ mb: 4 }} action={<Button color="inherit" size="small" onClick={() => window.location.reload()}>Riprova</Button>}>
                    {fetchError}
                </Alert>
            )}
            {loading ? (
                <CircularProgress />
            ) : programmi.length === 0 ? (
                <Typography variant="h6" color="text.secondary">Nessun programma trovato. Inizia aggiungendo un nuovo programma!</Typography>
            ) : (
                <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 3 }}>
                    {programmi.map((p: ProgrammaConModuli) => (
                        <Paper key={p.id} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <ProgrammaCard
                                programma={p}
                                onProgrammaUpdated={fetchProgrammi}
                                onDeleteProgramma={handleDeleteProgramma}
                            />
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
    );
}