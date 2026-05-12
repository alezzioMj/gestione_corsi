"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreaCommessaPage;
const MyStepper_1 = __importDefault(require("@/components/Stepper/MyStepper"));
const material_1 = require("@mui/material");
const API_BASE_URL = "http://localhost:3001";
async function getSedi() {
    const res = await fetch(`${API_BASE_URL}/sedi`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Errore durante il recupero delle sedi: ${res.statusText}`);
    }
    return res.json();
}
async function getProgrammi() {
    const res = await fetch(`${API_BASE_URL}/programmi`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Errore durante il recupero dei programmi: ${res.statusText}`);
    }
    return res.json();
}
async function getDocenti() {
    const res = await fetch(`${API_BASE_URL}/docenti`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Errore durante il recupero dei docenti: ${res.statusText}`);
    }
    return res.json();
}
async function CreaCommessaPage() {
    // Recuperiamo i dati necessari per popolare le opzioni dello stepper
    const [sedi, programmi, docenti] = await Promise.all([
        getSedi(),
        getProgrammi(),
        getDocenti(),
    ]);
    return (<material_1.Container maxWidth="lg" sx={{ py: 4 }}>
            <material_1.Box sx={{ mb: 4 }}>
                <material_1.Typography variant="h4" fontWeight="bold" gutterBottom>
                    Crea Nuova Commessa
                </material_1.Typography>
                <material_1.Typography variant="body1" color="text.secondary">
                    Inserisci i dettagli del corso, associa i docenti e genera automaticamente il calendario delle sessioni.
                </material_1.Typography>
            </material_1.Box>

            <material_1.Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <MyStepper_1.default sedi={sedi} programmi={programmi} docenti={docenti}/>
            </material_1.Paper>
        </material_1.Container>);
}
