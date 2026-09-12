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
import EmptyState from "@/components/EmptyState";
import { Folder, FolderOffOutlined } from "@mui/icons-material";
import { useConfirm } from "@/components/ConfirmContext";
import { useSnackbar } from "@/components/SnackbarContext";

export default function ProgrammiPage() {
    const { data: programmi, isLoading, error, mutate } = useSWR(`${API_BASE_URL}/programmi`, fetcher);
    const { confirm } = useConfirm();
    const { showMessage } = useSnackbar();

    const handleDeleteProgramma = async (programmaId: number) => {
        const ok = await confirm({
            title: "Elimina programma",
            message: "Sei sicuro di voler eliminare questo programma?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        }
        )
        if (!ok) return;
        try {
            const res = await fetch(`${API_BASE_URL}/programmi/${programmaId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione del programma: ${res.statusText}`);
            }
            mutate();
            showMessage("Programma eliminato con successo!");
        } catch (error: unknown) {
            showMessage(`Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
            console.error("Errore nell'eliminazione del programma:", error);
        }
    };

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            <Box sx={{
                mb: 4
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap', // così non si rompe su schermi stretti
                    gap: 2,
                }}>
                    <Typography variant="h4">Programmi</Typography>
                    <AddProgrammaModal onProgrammaAdded={() => mutate()} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {" Gestione dei programmi didattici e dei relativi moduli "}
                </Typography>
            </Box>
            {error && (
                <Alert severity="error" sx={{ mb: 4 }} action={<Button color="inherit" size="small" onClick={() => mutate}>Riprova</Button>}>
                    {error.message}
                </Alert>
            )}
            {isLoading ? (
                <DelayedLoading />
            ) : programmi.length === 0 ? (
                <EmptyState
                    icon={FolderOffOutlined}
                    title={"Nessun programma trovato"}
                    description={"Inizia aggiungendo un nuovo programma"}
                />) : (
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