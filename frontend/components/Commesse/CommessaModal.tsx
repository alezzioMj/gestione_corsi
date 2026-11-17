
"use client";

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

import { Commessa } from "@progetto/shared/validation/commessa.schema";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useSnackbar } from "../SnackbarContext";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";

interface CommesseModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    commessa?: Commessa;
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
    scadenza: string;
    cliente_id: string;
    stato: string;
};

const STATI = [
    { value: "APERTA", label: "Aperta" },
    { value: "IN_CORSO", label: "In corso" },
    { value: "CHIUSA", label: "Chiusa" },
    { value: "ANNULLATA", label: "Annullata" }
];

const creaForm = (commessa?: Commessa): CommessaForm => {
    console.log(commessa?.codice_commessa);
    return ({
        codice_commessa: commessa?.codice_commessa ?? "",
        codice_ft: commessa?.codice_ft ?? "",
        codice_rlom: commessa?.codice_rlom ?? "",
        descrizione: commessa?.descrizione ?? "",
        scadenza: commessa?.scadenza
            ? new Date(commessa.scadenza).toISOString().slice(0, 10)
            : "",
        cliente_id: commessa?.cliente_id != null
            ? String(commessa.cliente_id)
            : "",
        stato: commessa?.stato ?? "APERTA"
    })
};

export default function CommesseModal({
    open,
    onClose,
    onSuccess,
    commessa
}: CommesseModalProps) {

    const isEdit = Boolean(commessa);

    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState(() => creaForm(commessa));
    const { showMessage } = useSnackbar();

    const {
        data: clienti,
        error: clientiError,
        isLoading: clientiLoading
    } = useSWR<ClienteOption[]>(
        open ? `${API_BASE_URL}/clienti` : null,
        fetcher
    );

    const aggiornaCampo = (campo: keyof CommessaForm, valore: string) => {
        setForm(prev => ({
            ...prev,
            [campo]: valore
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setSubmitting(true);

            const url = commessa
                ? `${API_BASE_URL}/commesse/${commessa.id}`
                : `${API_BASE_URL}/commesse`;

            const payload = {
                codice_commessa: form.codice_commessa.trim(),
                codice_ft: form.codice_ft.trim() || null,
                codice_rlom: form.codice_rlom.trim() || null,
                descrizione: form.descrizione.trim() || null,
                scadenza: form.scadenza || null,
                cliente_id: form.cliente_id
                    ? Number(form.cliente_id)
                    : null,
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
                const data = await res.json().catch(() => null);

                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Errore durante il salvataggio della commessa"
                );
            }

            showMessage(
                isEdit
                    ? "Commessa modificata con successo"
                    : "Commessa creata con successo"
            );

            onSuccess();

        } catch (err) {
            console.error("Errore nel salvataggio della commessa:", err);

            showMessage(
                err instanceof Error
                    ? err.message
                    : "Errore durante il salvataggio della commessa",
                "error"
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

                        {clientiError && (
                            <Alert severity="error">
                                Errore durante il caricamento dei clienti.
                            </Alert>
                        )}

                        <TextField
                            required
                            fullWidth
                            label="Codice commessa"
                            value={form.codice_commessa}
                            onChange={e =>
                                aggiornaCampo("codice_commessa", e.target.value)
                            }
                            slotProps={{
                                htmlInput: { maxLength: 255 }
                            }}
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
                                onChange={e =>
                                    aggiornaCampo("codice_ft", e.target.value)
                                }
                                slotProps={{
                                    htmlInput: { maxLength: 255 }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Codice RLOM"
                                value={form.codice_rlom}
                                onChange={e =>
                                    aggiornaCampo("codice_rlom", e.target.value)
                                }
                                slotProps={{
                                    htmlInput: { maxLength: 255 }
                                }}
                            />
                        </Box>

                        <TextField
                            select
                            fullWidth
                            label="Cliente"
                            value={form.cliente_id}
                            disabled={clientiLoading || Boolean(clientiError)}
                            onChange={e =>
                                aggiornaCampo("cliente_id", e.target.value)
                            }
                        >
                            <MenuItem value="">
                                Nessun cliente
                            </MenuItem>

                            {(clienti ?? []).map(cliente => (
                                <MenuItem
                                    key={cliente.id}
                                    value={String(cliente.id)}
                                >
                                    {cliente.ragione_sociale}
                                </MenuItem>
                            ))}
                        </TextField>

                        {clientiLoading && (
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                            }}>
                                <CircularProgress size={18} />
                                <Alert severity="info" sx={{ flex: 1 }}>
                                    Caricamento clienti...
                                </Alert>
                            </Box>
                        )}

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
                                onChange={e =>
                                    aggiornaCampo("scadenza", e.target.value)
                                }
                                slotProps={{
                                    inputLabel: { shrink: true }
                                }}
                            />

                            <TextField
                                select
                                fullWidth
                                label="Stato"
                                value={form.stato}
                                onChange={e =>
                                    aggiornaCampo("stato", e.target.value)
                                }
                            >
                                {STATI.map(stato => (
                                    <MenuItem
                                        key={stato.value}
                                        value={stato.value}
                                    >
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
                            onChange={e =>
                                aggiornaCampo("descrizione", e.target.value)
                            }
                        />

                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={submitting}>
                        Annulla
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting || clientiLoading}
                    >
                        {submitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : isEdit ? (
                            "Salva modifiche"
                        ) : (
                            "Crea commessa"
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
