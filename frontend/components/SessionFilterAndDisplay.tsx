"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from "@mui/material";
import SessionsTable from "@/components/Stepper/SessionTable";
import { useRouter, useSearchParams } from "next/navigation";
import { Corso, SessioneWithRelations } from "../validation/types";

// Centralizziamo l'URL del backend
const API_BASE_URL = "http://localhost:3001";

interface SessionFilterAndDisplayProps {
    initialSessions: SessioneWithRelations[];
    allCorsi: Corso[];
    initialCorsoIdFilter?: string | string[];
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
    const [selectedCorsoId, setSelectedCorsoId] = useState<string>(
        initialCorsoIdFilter ? (Array.isArray(initialCorsoIdFilter) ? initialCorsoIdFilter[0] : initialCorsoIdFilter) : ""
    );
    const [sessions, setSessions] = useState<SessioneWithRelations[]>(initialSessions);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to update sessions when initialCorsoIdFilter changes (e.g., from direct link)
    useEffect(() => {
        const currentCorsoId = initialCorsoIdFilter ? (Array.isArray(initialCorsoIdFilter) ? initialCorsoIdFilter[0] : initialCorsoIdFilter) : "";
        setSelectedCorsoId(currentCorsoId);
        setSessions(initialSessions); // Reset sessions to initial ones when filter changes from outside
    }, [initialCorsoIdFilter, initialSessions]);


    const handleCorsoChange = async (event: any) => {
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
        const query = current.toString();
        router.push(`/sessioni${query ? `?${query}` : ""}`);

        try {
            const fetchedSessions = await getSessionsFiltered(newCorsoId);
            setSessions(fetchedSessions);
        } catch (err: any) {
            console.error("Errore nel recupero delle sessioni filtrate:", err);
            setError(`Impossibile caricare le sessioni: ${err.message || 'Errore di rete'}.`);
            setSessions([]); // Clear sessions on error
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFilter = () => {
        setSelectedCorsoId("");
        setLoading(true);
        setError(null);

        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.delete("corsoId");
        const query = current.toString();
        router.push(`/sessioni${query ? `?${query}` : ""}`);

        // Re-fetch all sessions
        getSessionsFiltered("")
            .then(data => {
                setSessions(data);
            })
            .catch(err => {
                console.error("Errore nel recupero di tutte le sessioni:", err);
                setError(`Impossibile caricare tutte le sessioni: ${err.message || 'Errore di rete'}.`);
                setSessions([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
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