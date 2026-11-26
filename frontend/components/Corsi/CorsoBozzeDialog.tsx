"use client";

import useSWR, { useSWRConfig } from "swr";
import { Button, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { fetcher } from "@/lib/swr-config";
import { useConfirm } from "@/components/ConfirmContext";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { EntityDialog } from "@/components/common/EntityFormShell";
import BozzeEditor, { bozzeKey, type BozzeResponse } from "@/components/Sessioni/BozzeEditor";
import type { CorsoItem } from "./Corso";

interface CorsoBozzeDialogProps {
    open: boolean;
    corso: CorsoItem | null;
    onClose: () => void;
    onChanged: () => void;
}

export default function CorsoBozzeDialog({ open, corso, onClose, onChanged }: CorsoBozzeDialogProps) {
    return (
        <EntityDialog open={open} onClose={onClose} size="lg">
            {corso && <CorsoBozzeContent key={corso.id} corso={corso} onClose={onClose} onChanged={onChanged} />}
        </EntityDialog>
    );
}

function CorsoBozzeContent({
    corso, onClose, onChanged,
}: { corso: CorsoItem; onClose: () => void; onChanged: () => void }) {
    const { confirm } = useConfirm();
    const { mutate } = useSWRConfig();

    const { data } = useSWR<BozzeResponse>(bozzeKey(corso.id), fetcher);
    const bloccato = !data || data.conflitti.length > 0 || data.incomplete.length > 0;

    const { create: conferma, submitting: confermando } = useCreateEntity<Record<string, never>, unknown>(
        `/corsi/${corso.id}/scheduling/conferma`, "Sessioni confermate!"
    );
    
    const { remove, submitting: scartando } = useDeleteEntity(`/corsi/${corso.id}`);

    const handleConferma = async () => {
        if (await conferma({})) {
            onChanged();
            onClose();
        } else {
            await mutate(bozzeKey(corso.id)); // mostra i conflitti aggiornati
        }
    };

    const handleScarta = async () => {
        const ok = await confirm({
            title: "Scartare le bozze?",
            message: "Le sessioni in bozza verranno eliminate. Il corso resterà senza sessioni.",
            cancelText: "Annulla",
            confirmText: "Scarta bozze",
            confirmColor: "error",
        });
        if (!ok) return;

        if (await remove("scheduling")) {
            onChanged();
            onClose();
        }
    };

    return (
        <>
            <DialogTitle>Bozze sessioni: {corso.nome}</DialogTitle>
            <DialogContent dividers>
                <BozzeEditor
                    corsoId={corso.id}
                    docenti={corso.corso_docente.map((cd) => cd.docente)}
                    sedi={corso.corso_sede.map((cs) => cs.sede)}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button color="error" onClick={handleScarta} disabled={scartando || confermando} sx={{ mr: "auto" }}>
                    Scarta bozze
                </Button>
                <Button color="inherit" onClick={onClose}>Chiudi</Button>
                <Button variant="contained" onClick={handleConferma} disabled={bloccato || confermando || scartando}>
                    Conferma sessioni
                </Button>
            </DialogActions>
        </>
    );
}