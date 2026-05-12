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
exports.default = AddModuloModal;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Grid_1 = __importDefault(require("@mui/material/Grid"));
const Search_1 = __importDefault(require("@mui/icons-material/Search"));
const navigation_1 = require("next/navigation");
const config_1 = require("@/lib/config");
function AddModuloModal({ docente }) {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [moduli, setModuli] = (0, react_1.useState)([]);
    const [selectedIds, setSelectedIds] = (0, react_1.useState)([]);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
    const router = (0, navigation_1.useRouter)();
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setSearchQuery("");
    };
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Carica tutti i moduli totali disponibili nel sistema
            const resModuli = await fetch(`${config_1.API_BASE_URL}/moduli`);
            const allModuli = await resModuli.json();
            setModuli(allModuli);
            // 2. Carica i moduli attualmente associati a questo docente
            const resAssociazioni = await fetch(`${config_1.API_BASE_URL}/docenti/${docente.codice_fiscale}/moduli`, { cache: 'no-store' });
            if (resAssociazioni.status === 404) {
                setSelectedIds([]); // Il docente non ha moduli, puliamo lo stato
            }
            else if (resAssociazioni.ok) {
                const dataAssociazioni = await resAssociazioni.json();
                // Estrae gli ID in modo flessibile
                const currentIds = Array.isArray(dataAssociazioni)
                    ? dataAssociazioni.map((m) => m.modulo_id || "")
                    : (dataAssociazioni.docente_modulo?.map((m) => m.modulo_id) || []);
                setSelectedIds(currentIds);
            }
        }
        catch (error) {
            console.error("Errore nel caricamento dei moduli:", error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        if (open) {
            fetchData();
        }
    }, [open]);
    const handleToggle = (id) => () => {
        const currentIndex = selectedIds.indexOf(id);
        const newChecked = [...selectedIds];
        if (currentIndex === -1) {
            newChecked.push(id);
        }
        else {
            newChecked.splice(currentIndex, 1);
        }
        setSelectedIds(newChecked);
    };
    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${config_1.API_BASE_URL}/docenti/${docente.codice_fiscale}/moduli_bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ moduli_ids: selectedIds }),
            });
            if (res.ok) {
                router.refresh();
                handleClose();
            }
            else {
                alert("Errore durante il salvataggio delle competenze");
            }
        }
        catch (error) {
            console.error("Errore:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const filteredModuli = moduli.filter((modulo) => modulo.titolo.toLowerCase().includes(searchQuery.toLowerCase()));
    return (<>
            <material_1.Button variant="contained" onClick={handleOpen}>
                Associa Moduli
            </material_1.Button>
            <material_1.Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <material_1.DialogTitle>Associa Moduli a {docente.nome} {docente.cognome}</material_1.DialogTitle>
                <material_1.DialogContent dividers>
                    {loading && moduli.length === 0 ? (<material_1.Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <material_1.CircularProgress />
                        </material_1.Box>) : (<>
                            <material_1.Box sx={{ mb: 2, mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <material_1.TextField fullWidth size="small" placeholder="Cerca modulo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} slotProps={{
                input: {
                    startAdornment: (<material_1.InputAdornment position="start">
                                                    <Search_1.default fontSize="small"/>
                                                </material_1.InputAdornment>),
                },
            }}/>
                                <material_1.Box sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                                    {selectedIds.length} selezionati
                                </material_1.Box>
                            </material_1.Box>
                            <Grid_1.default container spacing={1}>
                                {filteredModuli.map((modulo) => (<Grid_1.default size={{ xs: 12, sm: 6 }} key={modulo.id}>
                                        <material_1.FormControlLabel control={<material_1.Checkbox checked={selectedIds.indexOf(modulo.id) !== -1} onChange={handleToggle(modulo.id)}/>} label={modulo.titolo}/>
                                    </Grid_1.default>))}
                            </Grid_1.default>
                        </>)}
                </material_1.DialogContent>
                <material_1.DialogActions>
                    <material_1.Button onClick={handleClose} disabled={loading}>Annulla</material_1.Button>
                    <material_1.Button onClick={handleSave} variant="contained" disabled={loading}>
                        {loading ? <material_1.CircularProgress size={24}/> : "Salva Competenze"}
                    </material_1.Button>
                </material_1.DialogActions>
            </material_1.Dialog>
        </>);
}
