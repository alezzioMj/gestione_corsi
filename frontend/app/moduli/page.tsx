"use client";

import {
    Box,
    Typography,
    Container,
    Button,
    Paper,
} from "@mui/material";
import ModuloCard from "@/components/Moduli/ModuloCard";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import EmptyState from "@/components/EmptyState";
import { ExtensionOffOutlined } from "@mui/icons-material";
import { Modulo } from "@progetto/shared/validation/modulo.schema";
import ModuloModal from "@/components/Moduli/ModuloModal";
import { useState } from "react";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import AddIcon from "@mui/icons-material/Add"
import AsyncContent from "@/components/AsyncContent";

export default function ModuliPage() {
    const { confirm } = useConfirm();
    const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null);
    const [open, setOpen] = useState(false);
    const { data: moduli, error, mutate } = useSWR<Modulo[]>('/moduli', fetcher);
    const { submitting: deleting, remove } = useDeleteEntity(`/moduli`);

    const handleDeleteModulo = async (moduloId: number) => {
        const ok = await confirm({
            title: "Elimina modulo",
            message: "Sei sicuro di voler eliminare questo modulo?",
            cancelText: "Annulla",
            confirmText: "Elimina",
            confirmColor: "error",
        }
        )
        if (!ok) return;
        const deleted = await remove(moduloId);
        if (deleted) mutate();
    };

    const onSuccess = () => {
        mutate();
        setOpen(false);
        setSelectedModulo(null);
    }

    const onClose = () => {
        setOpen(false);
    }

    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            <Box sx={{
                mb: 4
            }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2
                    }}
                >
                    <Typography variant="h4">Moduli</Typography>
                    <ModuloModal open={open} onClose={onClose} onSuccess={onSuccess} modulo={selectedModulo} />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedModulo(null);
                            setOpen(true);
                        }}
                    >
                        Aggiungi modulo
                    </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {" Gestione dei moduli didattici e dei relativi materiali "}
                </Typography>

            </Box>


            <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: 3 }}>
                <AsyncContent
                    data={moduli}
                    error={error}
                    onRetry={() => mutate()}
                    empty={
                        <EmptyState
                            icon={ExtensionOffOutlined}
                            title="Nessun modulo trovato"
                            description="Inizia aggiungendo un nuovo modulo"
                        />
                    }
                >
                    {(moduli) => moduli.map((m: Modulo) => (
                        <Paper
                            key={m.id}
                            variant="outlined"
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                width: '100%',
                                height: '100%'
                            }}
                        >    <ModuloCard
                                deleting={deleting}
                                modulo={m}
                                openModal={
                                    (modulo: Modulo) => {
                                        setSelectedModulo(modulo)
                                        setOpen(true);
                                    }}
                                onDeleteModulo={handleDeleteModulo}
                            />
                        </Paper>
                    ))}
                </AsyncContent>
            </Box>
        </Container >
    );
}