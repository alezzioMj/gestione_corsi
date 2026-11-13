
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    TextField,
    Typography
} from "@mui/material";

import {
    ClienteWithRelations,
    Contatto
} from "@progetto/shared/validation/types";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import SedeForm, { SedeFormData, ContattoForm } from "./SedeForm";

interface ClientiModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    cliente?: ClienteWithRelations;
}

type ClienteForm = {
    ragione_sociale: string;
    partita_iva: string;
    sedi: SedeFormData[];
};

// Converts an existing customer into editable form data
const creaForm = (cliente?: ClienteWithRelations): ClienteForm => ({
    ragione_sociale: cliente?.ragione_sociale ?? "",
    partita_iva: cliente?.partita_iva ?? "",
    sedi: cliente?.sedi.map(sede => ({
        ...sede,
        contatti: sede.contatti.map(contatto => ({ ...contatto }))
    })) ?? []
});

export default function ClientiModal({
    open,
    onClose,
    onSuccess,
    cliente
}: ClientiModalProps) {

    const isEdit = Boolean(cliente);

    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState<ClienteForm>(() => creaForm(cliente));

    const nuovaSede = (): SedeFormData => ({
        tipo: "OPERATIVA",
        nome: "",
        indirizzo: "",
        civico: "",
        cap: "",
        citta: "",
        provincia: "",
        contatti: []
    });

    const nuovoContatto = (): ContattoForm => ({
        nome: "",
        email: null,
        telefono: null
    });
    
    const aggiungiSede = () => {
        setForm(prev => ({
            ...prev,
            sedi: [...prev.sedi, nuovaSede()]
        }));
    };

    const rimuoviSede = (index: number) => {
        setForm(prev => prev.sedi.length > 1
            ? {
                ...prev,
                sedi: prev.sedi.filter((_, i) => i !== index)
            }
            : prev
        );
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
            )
        }));
    };

    const aggiungiContatto = (indexSede: number) => {
        setForm(prev => ({
            ...prev,
            sedi: prev.sedi.map((sede, i) =>
                i === indexSede
                    ? {
                        ...sede,
                        contatti: [...sede.contatti, nuovoContatto()]
                    }
                    : sede
            )
        }));
    };

    const rimuoviContatto = (
        indexSede: number,
        indexContatto: number
    ) => {
        setForm(prev => ({
            ...prev,
            sedi: prev.sedi.map((sede, i) =>
                i === indexSede
                    ? {
                        ...sede,
                        contatti: sede.contatti.filter(
                            (_, j) => j !== indexContatto
                        )
                    }
                    : sede
            )
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
                        )
                    }
                    : sede
            )
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        try {
            setSubmitting(true);

            const url = cliente
                ? `${API_BASE_URL}/clienti/${cliente.id}`
                : `${API_BASE_URL}/clienti`;

            const res = await fetch(url, {
                method: cliente ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(
                    data.error || "Errore durante il salvataggio del cliente"
                );
            }

            onSuccess();

        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            maxWidth="lg"
            fullWidth
            open={open}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {isEdit ? "Modifica cliente" : "Aggiungi cliente"}
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                        mt: 1
                    }}>

                        <TextField
                            required
                            fullWidth
                            label="Ragione Sociale"
                            value={form.ragione_sociale}
                            onChange={e => setForm(prev => ({
                                ...prev,
                                ragione_sociale: e.target.value
                            }))}
                        />

                        <TextField
                            required
                            fullWidth
                            label="P.IVA"
                            value={form.partita_iva}
                            onChange={e => setForm(prev => ({
                                ...prev,
                                partita_iva: e.target.value
                            }))}
                        />

                        <Divider />

                        <Typography variant="h6">
                            Sedi
                        </Typography>

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
                    <Button onClick={onClose}>
                        Annulla
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting
                            ? <CircularProgress size={24} />
                            : isEdit
                                ? "Salva modifiche"
                                : "Crea cliente"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
