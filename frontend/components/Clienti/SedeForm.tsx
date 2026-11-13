import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Divider,
    IconButton,
    Paper,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";

import { Contatto } from "@progetto/shared/validation/types";
import { DeleteOutlineOutlined } from "@mui/icons-material";

export type ContattoForm = {
    id?: number;
    sede_id?: number;
    nome: string;
    email?: string | null;
    telefono?: string | null;
};

export type SedeFormData = {
    id?: number;
    cliente_id?: number;
    tipo: "LEGALE" | "OPERATIVA";
    nome: string;
    indirizzo: string;
    civico: string;
    cap: string;
    citta: string;
    provincia: string;
    contatti: ContattoForm[];
};

interface SedeFormProps {
    sede: SedeFormData;
    index: number;
    onChange: (index: number, campo: string, valore: string) => void;
    onRemove: (index: number) => void;
    onAddContatto: (index: number) => void;
    onRemoveContatto: (indexSede: number, indexContatto: number) => void;
    onChangeContatto: (
        indexSede: number,
        indexContatto: number,
        campo: string,
        valore: string
    ) => void;
}

export default function SedeForm({
    sede, index, onChange, onRemove,
    onAddContatto, onRemoveContatto, onChangeContatto
}: SedeFormProps) {

    return (
        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", pr: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                        {sede.nome || `Sede ${index + 1}`}
                        {sede.citta && ` - ${sede.citta}`}
                    </Typography>

                    <Tooltip title="Rimuovi sede">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={e => { e.stopPropagation(); onRemove(index); }}
                            onFocus={e => e.stopPropagation()}
                        >
                            <DeleteOutlineOutlined />
                        </IconButton>
                    </Tooltip>
                </Box>
            </AccordionSummary>

            <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                    <TextField fullWidth label="Nome"
                        required
                        value={sede.nome}
                        onChange={e => onChange(index, "nome", e.target.value)}
                    />

                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField fullWidth label="Indirizzo" sx={{ flex: 3 }}
                            required
                            value={sede.indirizzo}
                            onChange={e => onChange(index, "indirizzo", e.target.value)}
                        />
                        <TextField label="Civico" sx={{ flex: 1 }}
                            required
                            value={sede.civico}
                            onChange={e => onChange(index, "civico", e.target.value)}
                        />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="CAP" sx={{ flex: 1 }}
                            required
                            value={sede.cap}
                            onChange={e => onChange(index, "cap", e.target.value)}
                        />
                        <TextField label="Città" sx={{ flex: 3 }}
                            required
                            value={sede.citta}
                            onChange={e => onChange(index, "citta", e.target.value)}
                        />
                        <TextField label="Provincia" sx={{ flex: 1 }}
                            required
                            value={sede.provincia}
                            onChange={e => onChange(index, "provincia", e.target.value)}
                        />
                    </Box>

                    <Divider />

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Contatti
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => onAddContatto(index)}
                        >
                            Aggiungi contatto
                        </Button>
                    </Box>

                    {sede.contatti.map((contatto, indexContatto) => (
                        <Paper
                            key={contatto.id ?? `nuovo-${indexContatto}`}
                            variant="outlined"
                            sx={{ p: 2 }}
                        >
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Typography variant="subtitle2">
                                        Contatto {indexContatto + 1}
                                    </Typography>
                                    <Tooltip title="Rimuovi contatto">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => onRemoveContatto(index, indexContatto)}
                                        >
                                            <DeleteOutlineOutlined />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <TextField fullWidth label="Nome"
                                    required
                                    value={contatto.nome}
                                    onChange={e => onChangeContatto(index, indexContatto, "nome", e.target.value)}
                                />

                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <TextField fullWidth label="Email"
                                        required
                                        value={contatto.email ?? ""}
                                        onChange={e => onChangeContatto(index, indexContatto, "email", e.target.value)}
                                    />
                                    <TextField fullWidth label="Telefono"
                                        required
                                        value={contatto.telefono ?? ""}
                                        onChange={e => onChangeContatto(index, indexContatto, "telefono", e.target.value)}
                                    />
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}