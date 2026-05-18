"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from "@mui/material";
import SessionsTable from "@/components/Stepper/SessionTable";
import { useRouter, useSearchParams } from "next/navigation";
import { SessioneWithRelations } from "../validation/types";
import { API_BASE_URL } from "@/lib/config";
import { SelectChangeEvent } from '@mui/material/Select';

interface SessionFilterAndDisplayProps {
    initialSessions: SessioneWithRelations[];
    allCorsi: Corso[];
    initialCorsoIdFilter?: string | string[];
}

interface Corso {
    id: number;
    nome: string;
    cliente: string;
    programma_id?: number;
    n_ore?: number;
    inizio?: string;
    fine?: string;
    note?: string;
}

async function getSessionsFiltered(corsoId?: string): Promise<SessioneWithRelations[]> {
    const url = corsoId 
        ? `${API_BASE_URL}/sessioni/full?corsoId=${corsoId}` 
        : `${API_BASE_URL}/sessioni/full`; 
        
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
    
    const initialCorsoId = initialCorsoIdFilter ? (Array.isArray(initialCorsoIdFilter) ? initialCorsoIdFilter[0] : initialCorsoIdFilter) : "";
    const [selectedCorsoId, setSelectedCorsoId] = useState<string>(initialCorsoId);
    const [sessions, setSessions] = useState<SessioneWithRelations[]>(initialSessions);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Funzione di fetch corretta
    const fetchSessions = useCallback(async (corsoId: string) => {
        setLoading(true);
        setError(null);
        try {
            const fetchedSessions = await getSessionsFiltered(corsoId);
            // ✅ CORRETTO: Adesso stampi i dati estratti, non la funzione stessa
            setSessions(fetchedSessions);
        } catch (err: unknown) {
            console.error("Errore nel recupero delle sessioni filtrate:", err);
            setError(`Impossibile caricare le sessioni: ${err instanceof Error ? err.message : String(err)}.`);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Sincronizza lo stato locale se i searchParams nell'URL cambiano (es. navigazione avanti/indietro)
    const urlCorsoId = searchParams.get("corsoId") || "";
    useEffect(() => {
        setSelectedCorsoId(urlCorsoId);
        fetchSessions(urlCorsoId);
    }, [urlCorsoId, fetchSessions]);

    const handleCorsoChange = (event: SelectChangeEvent<string>) => {
        const newCorsoId = event.target.value as string;
        setSelectedCorsoId(newCorsoId);

        // Aggiorna la URL query string in Next.js
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (newCorsoId) {
            current.set("corsoId", newCorsoId);
        } else {
            current.delete("corsoId");
        }
        const queryString = current.toString();
        router.push(`/sessioni${queryString ? `?${queryString}` : ""}`);
    };

    const handleRemoveFilter = () => {
        setSelectedCorsoId("");
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.delete("corsoId");
        const query = current.toString();
        router.push(`/sessioni${query ? `?${query}` : ""}`);
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
                            {corso.nome || corso.cliente} (ID: {corso.id})
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