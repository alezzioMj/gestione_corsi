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
exports.default = SessionFilterAndDisplay;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const SessionTable_1 = __importDefault(require("@/components/Stepper/SessionTable"));
const navigation_1 = require("next/navigation");
// Centralizziamo l'URL del backend
const API_BASE_URL = "http://localhost:3001";
async function getSessionsFiltered(corsoId) {
    const url = corsoId ? `${API_BASE_URL}/sessioni?corsoId=${corsoId}` : `${API_BASE_URL}/sessioni`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        if (res.status === 404) {
            console.warn("Nessuna sessione trovata per il filtro.");
            return [];
        }
        throw new Error(`Errore nel recupero delle sessioni: ${res.statusText}`);
    }
    return res.json();
}
function SessionFilterAndDisplay({ initialSessions, allCorsi, initialCorsoIdFilter }) {
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const [selectedCorsoId, setSelectedCorsoId] = (0, react_1.useState)(initialCorsoIdFilter ? (Array.isArray(initialCorsoIdFilter) ? initialCorsoIdFilter[0] : initialCorsoIdFilter) : "");
    const [sessions, setSessions] = (0, react_1.useState)(initialSessions);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    // Effect to update sessions when initialCorsoIdFilter changes (e.g., from direct link)
    (0, react_1.useEffect)(() => {
        const currentCorsoId = initialCorsoIdFilter ? (Array.isArray(initialCorsoIdFilter) ? initialCorsoIdFilter[0] : initialCorsoIdFilter) : "";
        setSelectedCorsoId(currentCorsoId);
        setSessions(initialSessions); // Reset sessions to initial ones when filter changes from outside
    }, [initialCorsoIdFilter, initialSessions]);
    const handleCorsoChange = async (event) => {
        const newCorsoId = event.target.value;
        setSelectedCorsoId(newCorsoId);
        setLoading(true);
        setError(null);
        // Update URL search params
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (newCorsoId) {
            current.set("corsoId", newCorsoId);
        }
        else {
            current.delete("corsoId");
        }
        const query = current.toString();
        router.push(`/sessioni${query ? `?${query}` : ""}`);
        try {
            const fetchedSessions = await getSessionsFiltered(newCorsoId);
            setSessions(fetchedSessions);
        }
        catch (err) {
            console.error("Errore nel recupero delle sessioni filtrate:", err);
            setError(`Impossibile caricare le sessioni: ${err.message || 'Errore di rete'}.`);
            setSessions([]); // Clear sessions on error
        }
        finally {
            setLoading(false);
        }
    };
    const handleRemoveFilter = () => {
        setSelectedCorsoId("");
        setLoading(true);
        setError(null);
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.delete("corsoId");
        const query = current.toString();
        router.push(`/sessioni${query ? `?${query}` : ""}`);
        // Re-fetch all sessions
        getSessionsFiltered("")
            .then(data => {
            setSessions(data);
        })
            .catch(err => {
            console.error("Errore nel recupero di tutte le sessioni:", err);
            setError(`Impossibile caricare tutte le sessioni: ${err.message || 'Errore di rete'}.`);
            setSessions([]);
        })
            .finally(() => {
            setLoading(false);
        });
    };
    return (<material_1.Box sx={{ p: 4 }}>
            <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <material_1.Typography variant="h4" fontWeight="bold">
                    {selectedCorsoId ? `Sessioni Corso #${selectedCorsoId}` : "Tutte le Sessioni"}
                </material_1.Typography>
                {selectedCorsoId && (<material_1.Button variant="text" onClick={handleRemoveFilter}>
                        Rimuovi Filtro
                    </material_1.Button>)}
            </material_1.Box>

            <material_1.FormControl fullWidth sx={{ mb: 4 }}>
                <material_1.InputLabel id="corso-select-label">Filtra per Corso</material_1.InputLabel>
                <material_1.Select labelId="corso-select-label" id="corso-select" value={selectedCorsoId} label="Filtra per Corso" onChange={handleCorsoChange}>
                    <material_1.MenuItem value="">
                        <em>Tutti i Corsi</em>
                    </material_1.MenuItem>
                    {allCorsi.map((corso) => (<material_1.MenuItem key={corso.id} value={corso.id.toString()}>
                            {corso.nome} (ID: {corso.id})
                        </material_1.MenuItem>))}
                </material_1.Select>
            </material_1.FormControl>

            {loading ? (<material_1.Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <material_1.CircularProgress />
                </material_1.Box>) : error ? (<material_1.Alert severity="error" sx={{ mt: 4 }}>{error}</material_1.Alert>) : (<SessionTable_1.default sessions={sessions}/>)}
        </material_1.Box>);
}
