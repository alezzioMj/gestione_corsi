"use client";

import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert } from "@mui/material"; // Added Alert
import Link from "next/link";
import React, { useState, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit'; // Import EditIcon

// Centralizziamo l'URL del backend
const API_BASE_URL = "http://localhost:3001";

// Definizione di un tipo base per un corso
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

async function getCorsi(): Promise<Corso[]> {
    const res = await fetch(`${API_BASE_URL}/corsi`, { cache: "no-store" });
    if (!res.ok) {
        if (res.status === 404) {
            console.warn("Nessun corso trovato.");
            return [];
        }
        throw new Error(`Errore ${res.status}: ${res.statusText}`);
    }
    return res.json();
}

export default function CommessePage() {
    const [corsi, setCorsi] = useState<Corso[]>([]);
    const [openInfoModal, setOpenInfoModal] = useState(false);
    const [selectedCorsoInfo, setSelectedCorsoInfo] = useState<Corso | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(false);
    const [infoError, setInfoError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null); // New state for general fetch errors

    useEffect(() => {
        setLoading(true); // Ensure loading is true on effect run
        setFetchError(null); // Clear previous errors
        getCorsi()
            .then(data => {
                setCorsi(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Errore nel recupero dei corsi:", err);
                setFetchError(`Impossibile caricare i corsi: ${err.message || 'Errore di rete'}. Assicurati che il backend sia attivo.`);
                setLoading(false);
            });
    }, []);

    // Logica per l'eliminazione di un corso
    const handleDelete = async (corsoId: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo corso? Tutte le sessioni associate verranno eliminate.")) {
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/corsi/${corsoId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione del corso: ${res.statusText}`);
            }
            // Aggiorna lo stato per rimuovere il corso eliminato
            setCorsi(prevCorsi => prevCorsi.filter(corso => corso.id !== corsoId));
            alert("Corso eliminato con successo!");
        } catch (error: any) {
            alert(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione del corso:", error);
        }
    };

    // Logica per l'apertura del modal info
    const handleOpenInfo = async (corsoId: number) => {
        setIsLoadingInfo(true);
        setInfoError(null);
        setOpenInfoModal(true); // Apri il modal immediatamente per mostrare lo stato di caricamento
        try {
            const res = await fetch(`${API_BASE_URL}/corsi/${corsoId}`, { cache: "no-store" }); // Fetch dettagli specifici
            if (!res.ok) {
                throw new Error(`Errore durante il recupero delle informazioni del corso: ${res.status} - ${res.statusText}`);
            }
            const data = await res.json();
            setSelectedCorsoInfo(data);
        } catch (error: any) {
            console.error("Errore nel recupero info corso:", error);
            setInfoError(error.message);
        } finally {
            setIsLoadingInfo(false);
        }
    };

    const handleCloseInfo = () => {
        setOpenInfoModal(false);
        setSelectedCorsoInfo(null);
        setInfoError(null);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Gestione Commesse</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Visualizza e gestisci tutti i corsi (commesse) creati.
            </Typography>

            <Link href="/commesse/crea" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="primary" sx={{ mb: 4 }}>
                    Crea Nuova Commessa
                </Button>
            </Link>

            {fetchError && ( // Display general fetch error
                <Alert 
                    severity="error" 
                    sx={{ mb: 4 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                            Riprova
                        </Button>
                    }
                >
                    {fetchError}
                </Alert>
            )}

            {loading ? (
                <CircularProgress />
            ) : corsi.length === 0 ? (
                <Typography variant="h6" color="text.secondary">Nessun corso (commessa) trovato. Inizia creando una nuova commessa!</Typography>
            ) : (
                <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Corsi Esistenti</Typography>
                    {corsi.map((corso) => (
                        <Box key={corso.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">{corso.nome} (ID: {corso.id})</Typography>
                                <Typography variant="body2">Cliente: {corso.cliente}</Typography>
                            </Box>
                            <Box>
                                <Button variant="outlined" size="small" sx={{ mt: 1, mr: 1 }} onClick={() => handleOpenInfo(corso.id)} startIcon={<InfoIcon />}>
                                    Info
                                </Button>
                                <Link href={`/sessioni?corsoId=${corso.id}`} style={{ textDecoration: 'none' }}>
                                    <Button variant="outlined" size="small" sx={{ mt: 1, mr: 1 }}>
                                        Visualizza Sessioni
                                    </Button>
                                </Link>
                                <Link href={`/commesse/edit/${corso.id}`} passHref>
                                    <Button variant="outlined" size="small" sx={{ mt: 1, mr: 1 }} startIcon={<EditIcon />}>
                                        Modifica
                                    </Button>
                                </Link>
                                <Button variant="outlined" color="error" size="small" sx={{ mt: 1 }} onClick={() => handleDelete(corso.id)} startIcon={<DeleteIcon />}>
                                    Elimina
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Modal per le informazioni del corso */}
            <Dialog open={openInfoModal} onClose={handleCloseInfo} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Dettagli Corso
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseInfo}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {isLoadingInfo && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>Caricamento informazioni...</Typography>
                        </Box>
                    )}
                    {infoError && <Typography color="error">{infoError}</Typography>}
                    {selectedCorsoInfo && !isLoadingInfo && !infoError && (
                        <Box>
                            <Typography variant="h6" gutterBottom>{selectedCorsoInfo.nome}</Typography>
                            <Typography variant="body1">**ID:** {selectedCorsoInfo.id}</Typography>
                            <Typography variant="body1">**Cliente:** {selectedCorsoInfo.cliente}</Typography>
                            {selectedCorsoInfo.programma_id && <Typography variant="body1">**ID Programma:** {selectedCorsoInfo.programma_id}</Typography>}
                            {selectedCorsoInfo.n_ore && <Typography variant="body1">**Ore Totali:** {selectedCorsoInfo.n_ore}</Typography>}
                            {selectedCorsoInfo.inizio && <Typography variant="body1">**Data Inizio:** {new Date(selectedCorsoInfo.inizio).toLocaleDateString('it-IT')}</Typography>}
                            {selectedCorsoInfo.fine && <Typography variant="body1">**Data Fine:** {new Date(selectedCorsoInfo.fine).toLocaleDateString('it-IT')}</Typography>}
                            {selectedCorsoInfo.note && <Typography variant="body1">**Note:** {selectedCorsoInfo.note}</Typography>}
                            {/* Aggiungi qui altri dettagli del corso se necessario */}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseInfo}>Chiudi</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}