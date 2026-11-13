import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, TextField, Typography } from "@mui/material";
import { ClienteWithRelations, Contatto } from "@progetto/shared/validation/types";
import { useState } from "react";
import SedeForm from "./SedeForm";

interface ClientiModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    cliente?: ClienteWithRelations; // presente => modifica, assente => creazione
}

type SedeForm = {
    id?: number;
    nome: string;
    indirizzo: string;
    civico: string;
    cap: string;
    citta: string;
    provincia: string;
    contatti: Contatto[];
};

type ClienteForm = {
    ragione_sociale: string;
    partita_iva: string;
    sedi: SedeForm[];
};

export default function ClientiModal({ open, onClose, onSuccess, cliente }: ClientiModalProps) {
    const nuovaSede = () => ({
        nome: "",
        indirizzo: "",
        civico: "",
        cap: "",
        citta: "",
        provincia: "",
        contatti: [],
    });

    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState<ClienteForm>({
        ragione_sociale: cliente?.ragione_sociale ?? "",
        partita_iva: cliente?.partita_iva ?? "",
        sedi: cliente?.sedi ?? [nuovaSede()],
    });

    const aggiungiSede = () => {
        setForm(prev => ({
            ...prev,
            sedi: [...prev.sedi, nuovaSede()],
        }));
    };

    const rimuoviSede = (index: number) => {
        setForm(prev => prev.sedi.length > 1 ? ({
            ...prev,
            sedi: prev.sedi.filter((_, i) => i !== index),
        }) : prev);
    };

    const aggiornaSede = (
        index: number,
        campo: string,
        valore: string
    ) => {
        setForm(prev => ({
            ...prev,
            sedi: prev.sedi.map((sede, i) =>
                i === index
                    ? { ...sede, [campo]: valore }
                    : sede
            ),
        }));
    };

    const nuovoContatto = (): Contatto => ({
        id: 1,
        sede_id: 1,
        nome: "",
        email: null,
        telefono: null,
    });

    const aggiungiContatto = (indexSede: number) => {
        setForm(prev => ({
            ...prev,
            sedi: prev.sedi.map((sede, i) =>
                i === indexSede
                    ? { ...sede, contatti: [...sede.contatti, nuovoContatto()] }
                    : sede
            ),
        }));
    };

    const rimuoviContatto = (indexSede: number, indexContatto: number) => {
        setForm(prev => ({
            ...prev,
            sedi: prev.sedi.map((sede, i) =>
                i === indexSede
                    ? {
                        ...sede,
                        contatti: sede.contatti.filter((_, j) => j !== indexContatto),
                    }
                    : sede
            ),
        }));
    };

    const aggiornaContatto = (
        indexSede: number,
        indexContatto: number,
        campo: string,
        valore: string
    ) => {
        setForm(prev => ({
            ...prev,
            sedi: prev.sedi.map((sede, i) =>
                i === indexSede
                    ? {
                        ...sede,
                        contatti: sede.contatti.map((contatto, j) =>
                            j === indexContatto
                                ? { ...contatto, [campo]: valore }
                                : contatto
                        ),
                    }
                    : sede
            ),
        }));
    };

    return (
        <Dialog maxWidth="lg" fullWidth open={open}>
            <form>
                <DialogTitle>Aggiungi cliente</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

                        <TextField
                            fullWidth
                            label="Ragione Sociale"
                        />
                        <TextField
                            fullWidth
                            label="P.IVA"
                        />
                        <Divider></Divider>

                        <Typography variant="h6">Sedi</Typography>

                        {form.sedi.map((sede, index) => (
                            <SedeForm
                                key={sede.id ?? `nuova-${index}`}
                                sede={sede}
                                index={index}
                                onChange={aggiornaSede}
                                onRemove={rimuoviSede}
                                onAddContatto={aggiungiContatto}
                                onRemoveContatto={rimuoviContatto}
                                onChangeContatto={aggiornaContatto}
                            />
                        ))}
                        <Button
                            variant="outlined"
                            onClick={aggiungiSede}
                        >
                            Aggiungi ulteriore sede
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Annulla</Button>
                    <Button type="submit" variant="contained" disabled={submitting}>
                        {submitting ? <CircularProgress size={24} /> : "Salva"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}