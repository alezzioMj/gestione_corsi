"use client";

import {
    Button,
    TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { API_ENDPOINTS } from "@/lib/api";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import FormDialog from "../common/FormDialog";
import { useModalForm } from "@/hooks/useModalForm";

interface AddAulaModalProps {
    sedeId: number;
    onAulaAdded: () => void
}

const EMPTY = { nome: "", capienza: "", descrizione: "" };

export default function AddAulaModal({ sedeId, onAulaAdded }: AddAulaModalProps) {
    const { submitting, create } = useCreateEntity(API_ENDPOINTS.aule);
    const { open, openModal, closeModal, formData, setFormData } = useModalForm(EMPTY);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await create({
            nome: formData.nome,
            capienza: Number(formData.capienza),
            descrizione: formData.descrizione,
            sede_id: sedeId,
        });
        if (ok) {
            closeModal();
            onAulaAdded();
        }
    };

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openModal}>
                Aggiungi Aula
            </Button>

            <FormDialog open={open} title="Nuova Aula" maxWidth="md"
                submitting={submitting} onClose={closeModal} onSubmit={handleSubmit}>
                <TextField
                    label="Nome Aula"
                    fullWidth
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
                <TextField
                    label="Capienza"
                    type="number"
                    fullWidth
                    value={formData.capienza}
                    onChange={(e) => setFormData({ ...formData, capienza: e.target.value })}
                />
                <TextField
                    label="Descrizione"
                    fullWidth
                    value={formData.descrizione}
                    onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                />
            </FormDialog>
        </>
    );
}