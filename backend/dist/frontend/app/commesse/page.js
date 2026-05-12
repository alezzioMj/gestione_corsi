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
exports.default = CommessePage;
const material_1 = require("@mui/material"); // Added Alert
const link_1 = __importDefault(require("next/link"));
const react_1 = __importStar(require("react"));
const Close_1 = __importDefault(require("@mui/icons-material/Close"));
const Delete_1 = __importDefault(require("@mui/icons-material/Delete"));
const Info_1 = __importDefault(require("@mui/icons-material/Info"));
const Edit_1 = __importDefault(require("@mui/icons-material/Edit")); // Import EditIcon
// Centralizziamo l'URL del backend
const API_BASE_URL = "http://localhost:3001";
async function getCorsi() {
    const res = await fetch(`${API_BASE_URL}/corsi`, { cache: "no-store" });
    if (!res.ok) {
        if (res.status === 404) {
            console.warn("Nessun corso trovato.");
            return [];
        }
        throw new Error(`Errore ${res.status}: ${res.statusText}`);
    }
    return res.json();
}
function CommessePage() {
    const [corsi, setCorsi] = (0, react_1.useState)([]);
    const [openInfoModal, setOpenInfoModal] = (0, react_1.useState)(false);
    const [selectedCorsoInfo, setSelectedCorsoInfo] = (0, react_1.useState)(null);
    const [isLoadingInfo, setIsLoadingInfo] = (0, react_1.useState)(false);
    const [infoError, setInfoError] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [fetchError, setFetchError] = (0, react_1.useState)(null); // New state for general fetch errors
    (0, react_1.useEffect)(() => {
        setLoading(true); // Ensure loading is true on effect run
        setFetchError(null); // Clear previous errors
        getCorsi()
            .then(data => {
            setCorsi(data);
            setLoading(false);
        })
            .catch(err => {
            console.error("Errore nel recupero dei corsi:", err);
            setFetchError(`Impossibile caricare i corsi: ${err.message || 'Errore di rete'}. Assicurati che il backend sia attivo.`);
            setLoading(false);
        });
    }, []);
    // Logica per l'eliminazione di un corso
    const handleDelete = async (corsoId) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo corso? Tutte le sessioni associate verranno eliminate.")) {
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/corsi/${corsoId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore durante l'eliminazione del corso: ${res.statusText}`);
            }
            // Aggiorna lo stato per rimuovere il corso eliminato
            setCorsi(prevCorsi => prevCorsi.filter(corso => corso.id !== corsoId));
            alert("Corso eliminato con successo!");
        }
        catch (error) {
            alert(`Errore: ${error.message}`);
            console.error("Errore nell'eliminazione del corso:", error);
        }
    };
    // Logica per l'apertura del modal info
    const handleOpenInfo = async (corsoId) => {
        setIsLoadingInfo(true);
        setInfoError(null);
        setOpenInfoModal(true); // Apri il modal immediatamente per mostrare lo stato di caricamento
        try {
            const res = await fetch(`${API_BASE_URL}/corsi/${corsoId}`, { cache: "no-store" }); // Fetch dettagli specifici
            if (!res.ok) {
                throw new Error(`Errore durante il recupero delle informazioni del corso: ${res.status} - ${res.statusText}`);
            }
            const data = await res.json();
            setSelectedCorsoInfo(data);
        }
        catch (error) {
            console.error("Errore nel recupero info corso:", error);
            setInfoError(error.message);
        }
        finally {
            setIsLoadingInfo(false);
        }
    };
    const handleCloseInfo = () => {
        setOpenInfoModal(false);
        setSelectedCorsoInfo(null);
        setInfoError(null);
    };
    return (<material_1.Box sx={{ p: 4 }}>
            <material_1.Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Gestione Commesse</material_1.Typography>
            <material_1.Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Visualizza e gestisci tutti i corsi (commesse) creati.
            </material_1.Typography>

            <link_1.default href="/commesse/crea" style={{ textDecoration: 'none' }}>
                <material_1.Button variant="contained" color="primary" sx={{ mb: 4 }}>
                    Crea Nuova Commessa
                </material_1.Button>
            </link_1.default>

            {fetchError && ( // Display general fetch error
        <material_1.Alert severity="error" sx={{ mb: 4 }} action={<material_1.Button color="inherit" size="small" onClick={() => window.location.reload()}>
                            Riprova
                        </material_1.Button>}>
                    {fetchError}
                </material_1.Alert>)}

            {loading ? (<material_1.CircularProgress />) : corsi.length === 0 ? (<material_1.Typography variant="h6" color="text.secondary">Nessun corso (commessa) trovato. Inizia creando una nuova commessa!</material_1.Typography>) : (<material_1.Box>
                    <material_1.Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Corsi Esistenti</material_1.Typography>
                    {corsi.map((corso) => (<material_1.Box key={corso.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <material_1.Box>
                                <material_1.Typography variant="subtitle1" fontWeight="bold">{corso.nome} (ID: {corso.id})</material_1.Typography>
                                <material_1.Typography variant="body2">Cliente: {corso.cliente}</material_1.Typography>
                            </material_1.Box>
                            <material_1.Box>
                                <material_1.Button variant="outlined" size="small" sx={{ mt: 1, mr: 1 }} onClick={() => handleOpenInfo(corso.id)} startIcon={<Info_1.default />}>
                                    Info
                                </material_1.Button>
                                <link_1.default href={`/sessioni?corsoId=${corso.id}`} style={{ textDecoration: 'none' }}>
                                    <material_1.Button variant="outlined" size="small" sx={{ mt: 1, mr: 1 }}>
                                        Visualizza Sessioni
                                    </material_1.Button>
                                </link_1.default>
                                <link_1.default href={`/commesse/edit/${corso.id}`} passHref>
                                    <material_1.Button variant="outlined" size="small" sx={{ mt: 1, mr: 1 }} startIcon={<Edit_1.default />}>
                                        Modifica
                                    </material_1.Button>
                                </link_1.default>
                                <material_1.Button variant="outlined" color="error" size="small" sx={{ mt: 1 }} onClick={() => handleDelete(corso.id)} startIcon={<Delete_1.default />}>
                                    Elimina
                                </material_1.Button>
                            </material_1.Box>
                        </material_1.Box>))}
                </material_1.Box>)}

            {/* Modal per le informazioni del corso */}
            <material_1.Dialog open={openInfoModal} onClose={handleCloseInfo} maxWidth="sm" fullWidth>
                <material_1.DialogTitle>
                    Dettagli Corso
                    <material_1.IconButton aria-label="close" onClick={handleCloseInfo} sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
        }}>
                        <Close_1.default />
                    </material_1.IconButton>
                </material_1.DialogTitle>
                <material_1.DialogContent dividers>
                    {isLoadingInfo && (<material_1.Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <material_1.CircularProgress />
                            <material_1.Typography sx={{ ml: 2 }}>Caricamento informazioni...</material_1.Typography>
                        </material_1.Box>)}
                    {infoError && <material_1.Typography color="error">{infoError}</material_1.Typography>}
                    {selectedCorsoInfo && !isLoadingInfo && !infoError && (<material_1.Box>
                            <material_1.Typography variant="h6" gutterBottom>{selectedCorsoInfo.nome}</material_1.Typography>
                            <material_1.Typography variant="body1">**ID:** {selectedCorsoInfo.id}</material_1.Typography>
                            <material_1.Typography variant="body1">**Cliente:** {selectedCorsoInfo.cliente}</material_1.Typography>
                            {selectedCorsoInfo.programma_id && <material_1.Typography variant="body1">**ID Programma:** {selectedCorsoInfo.programma_id}</material_1.Typography>}
                            {selectedCorsoInfo.n_ore && <material_1.Typography variant="body1">**Ore Totali:** {selectedCorsoInfo.n_ore}</material_1.Typography>}
                            {selectedCorsoInfo.inizio && <material_1.Typography variant="body1">**Data Inizio:** {new Date(selectedCorsoInfo.inizio).toLocaleDateString('it-IT')}</material_1.Typography>}
                            {selectedCorsoInfo.fine && <material_1.Typography variant="body1">**Data Fine:** {new Date(selectedCorsoInfo.fine).toLocaleDateString('it-IT')}</material_1.Typography>}
                            {selectedCorsoInfo.note && <material_1.Typography variant="body1">**Note:** {selectedCorsoInfo.note}</material_1.Typography>}
                            {/* Aggiungi qui altri dettagli del corso se necessario */}
                        </material_1.Box>)}
                </material_1.DialogContent>
                <material_1.DialogActions>
                    <material_1.Button onClick={handleCloseInfo}>Chiudi</material_1.Button>
                </material_1.DialogActions>
            </material_1.Dialog>
        </material_1.Box>);
}
