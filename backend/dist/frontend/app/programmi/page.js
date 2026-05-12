"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgrammiPage;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const ProgrammaCard_1 = __importDefault(require("@/components/Programmi/ProgrammaCard"));
const navigation_1 = require("next/navigation");
const config_1 = require("@/lib/config");
function ProgrammiPage() {
    const [programmi, setProgrammi] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [fetchError, setFetchError] = (0, react_1.useState)(null);
    const router = (0, navigation_1.useRouter)();
    const fetchProgrammi = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await fetch(`${config_1.API_BASE_URL}/programmi`, { cache: "no-store" });
            if (!res.ok) {
                if (res.status === 404) {
                    console.warn("Nessun programma trovato.");
                    setProgrammi([]);
                }
                else {
                    throw new Error(`Errore ${res.status}: ${res.statusText}`);
                }
            }
            else {
                const data = await res.json();
                setProgrammi(data);
            }
        }
        catch (err) {
            console.error("Errore nel recupero dei programmi:", err);
            setFetchError(`Impossibile caricare i programmi: ${err.message || 'Errore di rete'}. Assicurati che il backend sia attivo.`);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchProgrammi();
    }, []);
    const handleDeleteProgramma = async (programmaId) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo programma?"))
            return;
        try {
            const res = await fetch(`${config_1.API_BASE_URL}/programmi/${programmaId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione del programma: ${res.statusText}`);
            }
            setProgrammi(prevProgrammi => prevProgrammi.filter(p => p.id !== programmaId));
            alert("Programma eliminato con successo!");
        }
        catch (error) {
            alert(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione del programma:", error);
        }
        finally {
            router.refresh(); // For Next.js to re-fetch server components
        }
    };
    return (<material_1.Container maxWidth="lg" sx={{ py: 4 }}>
            <material_1.Box sx={{ mb: 4 }}>
                <material_1.Typography variant="h4" fontWeight="bold" gutterBottom>Programmi Formativi</material_1.Typography>
                <material_1.Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestione dei programmi didattici e dei moduli associati.
                </material_1.Typography>
                <material_1.Box sx={{ mb: 4 }}>
                    {/* Assumendo che esista un AddProgrammaModal simile a AddDocenteModal */}
                    {/* <AddProgrammaModal onProgrammaAdded={fetchProgrammi} /> */}
                    <material_1.Button variant="contained" onClick={() => alert("Implementa AddProgrammaModal")}>Aggiungi Programma</material_1.Button>
                </material_1.Box>
            </material_1.Box>
            {fetchError && (<material_1.Alert severity="error" sx={{ mb: 4 }} action={<material_1.Button color="inherit" size="small" onClick={() => window.location.reload()}>Riprova</material_1.Button>}>
                    {fetchError}
                </material_1.Alert>)}
            {loading ? (<material_1.CircularProgress />) : programmi.length === 0 ? (<material_1.Typography variant="h6" color="text.secondary">Nessun programma trovato. Inizia aggiungendo un nuovo programma!</material_1.Typography>) : (<material_1.Box sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 3 }}>
                    {programmi.map((p) => (<material_1.Paper key={p.id} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <ProgrammaCard_1.default programma={p} onProgrammaUpdated={fetchProgrammi} onDeleteProgramma={handleDeleteProgramma}/>
                        </material_1.Paper>))}
                </material_1.Box>)}
        </material_1.Container>);
}
