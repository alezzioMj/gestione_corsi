"use client";

import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert, Container } from "@mui/material"; // Added Alert
import Link from "next/link";
import React, { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import { API_BASE_URL } from "@/lib/config";
import useSWR from 'swr';
import DelayedLoading from "@/components/DelayedLoading";
import { fetcher } from "@/lib/swr-config";

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

export default function CommessePage() {

    const { data: corsi, error, isLoading, mutate } = useSWR(`${API_BASE_URL}/corsi`, fetcher);
    const [openInfoModal, setOpenInfoModal] = useState(false);
    const [selectedCorsoInfo, setSelectedCorsoInfo] = useState<Corso | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(false);
    const [infoError, setInfoError] = useState<string | null>(null);

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
            mutate();
            alert("Corso eliminato con successo!");
        } catch (error: unknown) {
            alert(`Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
            console.error("Errore nell'eliminazione del corso:", error);
        }
    };

    // Logica per l'apertura del modal info
    const handleOpenInfo = async (corsoId: number) => {
        setIsLoadingInfo(true);
        setInfoError(null);
        setOpenInfoModal(true); // Apri il modal per mostrare lo stato di caricamento
        if (!corsoId) {
            console.log("corsoId non ancora disponibile, salto il fetch.");
            return; // Oppure metti un return di default a seconda di dove ti trovi
        }
        try {
            const res = await fetcher(`${API_BASE_URL}/corsi/${corsoId}`); // Fetch dettagli specifici            
            setSelectedCorsoInfo(res);
        } catch (error: unknown) {
            console.error("Errore nel recupero info corso:", error);
            setInfoError(error instanceof Error ? error.message : "Errore sconosciuto");
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

        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>Gestione Commesse</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Visualizza e gestisci tutti i corsi (commesse) creati.
                </Typography>

                <Link href="/commesse/crea" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary" sx={{ mb: 4 }}>
                        Crea Nuova Commessa
                    </Button>
                </Link>

                {error && ( // Display SWR error
                    <Alert
                        severity="error"
                        sx={{ mb: 4 }}
                        action={
                            <Button color="inherit" size="small" onClick={() => mutate()}>
                                Riprova
                            </Button>
                        }
                    >
                        {error.message || "Errore nel caricamento dei corsi."}
                    </Alert>
                )}

                {isLoading ? ( // Use SWR's isLoading
                    <DelayedLoading />
                ) : corsi && corsi.length === 0 ? ( // Check su esitenza scorsi
                    <Typography variant="h6" color="text.secondary">Nessun corso (commessa) trovato. Inizia creando una nuova commessa!</Typography>
                ) : (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 2 }}>Corsi Esistenti</Typography>
                        {corsi && corsi.map((corso: Corso) => ( // Check esistenza corsi
                            <Box key={corso.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="subtitle1">{corso.nome} (ID: {corso.id})</Typography>
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
                                <Typography variant="body1">ID: {selectedCorsoInfo.id}</Typography>
                                <Typography variant="body1">Cliente: {selectedCorsoInfo.cliente}</Typography>
                                {selectedCorsoInfo.programma_id && <Typography variant="body1">ID Programma: {selectedCorsoInfo.programma_id}</Typography>}
                                {selectedCorsoInfo.n_ore && <Typography variant="body1">Ore Totali: {selectedCorsoInfo.n_ore}</Typography>}
                                {selectedCorsoInfo.inizio && <Typography variant="body1">Data Inizio: {new Date(selectedCorsoInfo.inizio).toLocaleDateString('it-IT')}</Typography>}
                                {selectedCorsoInfo.fine && <Typography variant="body1">Data Fine: {new Date(selectedCorsoInfo.fine).toLocaleDateString('it-IT')}</Typography>}
                                {selectedCorsoInfo.note && <Typography variant="body1">Note: {selectedCorsoInfo.note}</Typography>}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseInfo}>Chiudi</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
}