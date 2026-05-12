"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from "@mui/material";
import SessionsTable from "@/components/Stepper/SessionTable";
import { useRouter, useSearchParams } from "next/navigation";
import { Corso, SessioneWithRelations } from "../validation/types";

// Centralizziamo l'URL del backend
const API_BASE_URL = "http://localhost:3001";
import { SelectChangeEvent } from '@mui/material/Select'; // Import SelectChangeEvent

interface SessionFilterAndDisplayProps {
    initialSessions: SessioneWithRelations[];
    allCorsi: Corso[];
    initialCorsoIdFilter?: string | string[];
}

// Definizione locale dell'interfaccia Corso per includere 'nome' se non è già in validation/types
interface Corso {
    id: number;
    nome: string; // Aggiunto 'nome' per risolvere l'errore TypeScript
    cliente: string;
    programma_id?: number;
    n_ore?: number;
    inizio?: string;
    fine?: string;
    note?: string;
}

async function getSessionsFiltered(corsoId?: string): Promise<SessioneWithRelations[]> {
    const url = corsoId ? `${API_BASE_URL}/sessioni?corsoId=${corsoId}` : `${API_BASE_URL}/sessioni`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        if (res.status === 404) {
            console.warn("Nessuna sessione trovata per il filtro.");
            return [];
        }
        throw new Error(`Errore nel recupero delle sessioni: ${res.statusText}`);
    }
    return res.json();
}

export default function SessionFilterAndDisplay({ initialSessions, allCorsi, initialCorsoIdFilter }: SessionFilterAndDisplayProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Inizializza gli stati direttamente dalle props.
    // Quando initialCorsoIdFilter o initialSessions cambiano, React re-renderizza il componente,
    // e questi useState initializers vengono eseguiti di nuovo, aggiornando efficacemente lo stato.
    const initialCorsoId = initialCorsoIdFilter ? (Array.isArray(initialCorsoIdFilter) ? initialCorsoIdFilter[0] : initialCorsoIdFilter) : "";
    const [selectedCorsoId, setSelectedCorsoId] = useState<string>(initialCorsoId);
    const [sessions, setSessions] = useState<SessioneWithRelations[]>(initialSessions); // Questo stato verrà aggiornato da fetchSessions
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // useCallback per la funzione di fetching per prevenire ricreazioni non necessarie
    const fetchSessions = useCallback(async (corsoId: string) => {
        setLoading(true);
        setError(null);
        try {
            const fetchedSessions = await getSessionsFiltered(corsoId);
            setSessions(fetchedSessions);
        } catch (err: unknown) { // Utilizza 'unknown' per il tipo di errore nel catch
            console.error("Errore nel recupero delle sessioni filtrate:", err);
            setError(`Impossibile caricare le sessioni: ${err instanceof Error ? err.message : String(err)}.`);
            setSessions([]); // Pulisci le sessioni in caso di errore
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect per recuperare le sessioni quando selectedCorsoId cambia
    useEffect(() => {
        fetchSessions(selectedCorsoId);
    }, [selectedCorsoId, fetchSessions]);

    const handleCorsoChange = async (event: SelectChangeEvent<string>) => { // Tipo corretto per l'evento
        const newCorsoId = event.target.value as string;
        setSelectedCorsoId(newCorsoId);
        setLoading(true);
        setError(null);

        // Update URL search params
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (newCorsoId) {
            current.set("corsoId", newCorsoId);
        } else {
            current.delete("corsoId");
        }
        const queryString = current.toString();
        router.push(`/sessioni${queryString ? `?${queryString}` : ""}`);
        // L'useEffect sopra gestirà il fetching delle sessioni quando selectedCorsoId cambia
        // Nessun fetching diretto qui per evitare race conditions e mantenere la logica centralizzata.
    };

    const handleRemoveFilter = () => {
        setSelectedCorsoId("");
        setLoading(true);
        setError(null);

        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.delete("corsoId");
        const query = current.toString();
        router.push(`/sessioni${query ? `?${query}` : ""}`); // Aggiorna l'URL
        // Impostare selectedCorsoId su "" attiverà l'useEffect per recuperare tutte le sessioni
        // e aggiornare lo stato 'sessions'.
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    {selectedCorsoId ? `Sessioni Corso #${selectedCorsoId}` : "Tutte le Sessioni"}
                </Typography>
                {selectedCorsoId && (
                    <Button variant="text" onClick={handleRemoveFilter}>
                        Rimuovi Filtro
                    </Button>
                )}
            </Box>

            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel id="corso-select-label">Filtra per Corso</InputLabel>
                <Select
                    labelId="corso-select-label"
                    id="corso-select"
                    value={selectedCorsoId}
                    label="Filtra per Corso"
                    onChange={handleCorsoChange}
                >
                    <MenuItem value="">
                        <em>Tutti i Corsi</em>
                    </MenuItem>
                    {allCorsi.map((corso) => (
                        <MenuItem key={corso.id} value={corso.id.toString()}>
                            {corso.nome} (ID: {corso.id})
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
            ) : (
                <SessionsTable sessions={sessions} />
            )}
        </Box>
    );
}