import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField
} from "@mui/material";

import { CommessaSchema } from "@progetto/shared/validation/types"; // adatta il percorso

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";

interface CommesseModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    commessa?: CommessaSchema;
}

type ClienteOption = {
    id: number;
    ragione_sociale: string;
};

type CommessaForm = {
    codice_commessa: string;
    codice_ft: string;
    codice_rlom: string;
    descrizione: string;
    scadenza: string;   // formato YYYY-MM-DD, come richiede <input type="date">
    cliente_id: string; // stringa vuota = nessun cliente
    stato: string;
};

// Valori dell'enum stato_commessa del tuo schema Prisma: completa l'elenco
const STATI = [
    { value: "APERTA", label: "Aperta" }
    // { value: "...", label: "..." },
];

// Converte una commessa esistente in dati modificabili dal form
const creaForm = (commessa?: CommessaSchema): CommessaForm => ({
    codice_commessa: commessa?.codice_commessa ?? "",
    codice_ft: commessa?.codice_ft ?? "",
    codice_rlom: commessa?.codice_rlom ?? "",
    descrizione: commessa?.descrizione ?? "",
    scadenza: commessa?.scadenza
        ? new Date(commessa.scadenza).toISOString().slice(0, 10)
        : "",
    cliente_id: commessa?.cliente_id != null ? String(commessa.cliente_id) : "",
    stato: commessa?.stato ?? "APERTA"
});

export default function CommesseModal({
    open,
    onClose,
    onSuccess,
    commessa
}: CommesseModalProps) {

    const isEdit = Boolean(commessa);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clienti, setClienti] = useState<ClienteOption[]>([]);

    const [form, setForm] = useState<CommessaForm>(() => creaForm(commessa));

    // Carica l'elenco dei clienti per il campo di selezione
    useEffect(() => {
        if (!open) return;

        const caricaClienti = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/clienti`);
                if (!res.ok) throw new Error("Errore nel caricamento dei clienti");
                setClienti(await res.json());
            } catch (err) {
                console.error(err);
                setError("Impossibile caricare l'elenco dei clienti");
            }
        };

        caricaClienti();
    }, [open]);

    const aggiornaCampo = (campo: keyof CommessaForm, valore: string) => {
        setForm(prev => ({ ...prev, [campo]: valore }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError(null);

            const url = commessa
                ? `${API_BASE_URL}/commesse/${commessa.id}`
                : `${API_BASE_URL}/commesse`;

            // I campi vuoti diventano null, altrimenti la validazione
            // del backend rifiuta date e id inesistenti
            const payload = {
                codice_commessa: form.codice_commessa.trim(),
                codice_ft: form.codice_ft.trim() || null,
                codice_rlom: form.codice_rlom.trim() || null,
                descrizione: form.descrizione.trim() || null,
                scadenza: form.scadenza || null,
                cliente_id: form.cliente_id ? Number(form.cliente_id) : null,
                stato: form.stato
            };

            const res = await fetch(url, {
                method: commessa ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(
                    data.error || "Errore durante il salvataggio della commessa"
                );
            }

            onSuccess();

        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Errore durante il salvataggio della commessa"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            maxWidth="md"
            fullWidth
            open={open}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {isEdit ? "Modifica commessa" : "Aggiungi commessa"}
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                        mt: 1
                    }}>

                        {error && (
                            <Alert severity="error" onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            required
                            fullWidth
                            label="Codice commessa"
                            value={form.codice_commessa}
                            onChange={e => aggiornaCampo("codice_commessa", e.target.value)}
                            slotProps={{ htmlInput: { maxLength: 255 } }}
                        />

                        <Box sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 2.5
                        }}>
                            <TextField
                                fullWidth
                                label="Codice FT"
                                value={form.codice_ft}
                                onChange={e => aggiornaCampo("codice_ft", e.target.value)}
                                slotProps={{ htmlInput: { maxLength: 255 } }}
                            />

                            <TextField
                                fullWidth
                                label="Codice RLOM"
                                value={form.codice_rlom}
                                onChange={e => aggiornaCampo("codice_rlom", e.target.value)}
                                slotProps={{ htmlInput: { maxLength: 255 } }}
                            />
                        </Box>

                        <TextField
                            select
                            fullWidth
                            label="Cliente"
                            value={form.cliente_id}
                            onChange={e => aggiornaCampo("cliente_id", e.target.value)}
                        >
                            <MenuItem value="">Nessun cliente</MenuItem>
                            {clienti.map(cliente => (
                                <MenuItem key={cliente.id} value={String(cliente.id)}>
                                    {cliente.ragione_sociale}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 2.5
                        }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Scadenza"
                                value={form.scadenza}
                                onChange={e => aggiornaCampo("scadenza", e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />

                            <TextField
                                select
                                fullWidth
                                label="Stato"
                                value={form.stato}
                                onChange={e => aggiornaCampo("stato", e.target.value)}
                            >
                                {STATI.map(stato => (
                                    <MenuItem key={stato.value} value={stato.value}>
                                        {stato.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Descrizione"
                            value={form.descrizione}
                            onChange={e => aggiornaCampo("descrizione", e.target.value)}
                        />

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
                                : "Crea commessa"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}