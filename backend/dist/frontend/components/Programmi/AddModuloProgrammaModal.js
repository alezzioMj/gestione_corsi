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
exports.default = AddModuloProgrammaModal;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Grid_1 = __importDefault(require("@mui/material/Grid"));
const DragIndicator_1 = __importDefault(require("@mui/icons-material/DragIndicator"));
const Delete_1 = __importDefault(require("@mui/icons-material/Delete"));
const navigation_1 = require("next/navigation");
const core_1 = require("@dnd-kit/core");
const sortable_1 = require("@dnd-kit/sortable");
const utilities_1 = require("@dnd-kit/utilities");
const config_1 = require("@/lib/config");
// Componente per il singolo elemento della lista trascinabile
function SortableModuloItem({ modulo, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = (0, sortable_1.useSortable)({
        id: modulo.id,
    });
    const style = {
        transform: utilities_1.CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
        position: 'relative',
    };
    return (<material_1.Paper ref={setNodeRef} style={style} variant="outlined" sx={{
            p: 1.5,
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: isDragging ? "action.hover" : "background.paper",
            boxShadow: isDragging ? 3 : 0,
            touchAction: 'none' // Necessario per il corretto funzionamento su touch
        }}>
            <material_1.Box {...attributes} {...listeners} sx={{ cursor: "grab", display: "flex", alignItems: "center" }}>
                <DragIndicator_1.default color="action"/>
            </material_1.Box>
            <material_1.Typography sx={{ flexGrow: 1, fontSize: '0.875rem' }}>{modulo.titolo}</material_1.Typography>
            <material_1.IconButton size="small" onClick={onRemove} color="error">
                <Delete_1.default fontSize="small"/>
            </material_1.IconButton>
        </material_1.Paper>);
}
function AddModuloProgrammaModal({ programma }) {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [moduli, setModuli] = (0, react_1.useState)([]);
    const [selectedIds, setSelectedIds] = (0, react_1.useState)([]);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
    const router = (0, navigation_1.useRouter)();
    const sensors = (0, core_1.useSensors)((0, core_1.useSensor)(core_1.PointerSensor), (0, core_1.useSensor)(core_1.KeyboardSensor, {
        coordinateGetter: sortable_1.sortableKeyboardCoordinates,
    }));
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setSearchQuery("");
    };
    const fetchData = async () => {
        setLoading(true);
        try {
            const resModuli = await fetch(`${config_1.API_BASE_URL}/moduli`);
            const allModuli = await resModuli.json();
            setModuli(allModuli);
            const resAssociazioni = await fetch(`${config_1.API_BASE_URL}/programmi/${programma.id}/moduli`, { cache: 'no-store' });
            if (resAssociazioni.ok) {
                const data = await resAssociazioni.json();
                // Estraiamo gli ID mantenendo l'ordine restituito dal server (ordinato per colonna 'ordine')
                const currentIds = Array.isArray(data)
                    ? data.map((m) => m.modulo_id || m.id)
                    : (data.programma_modulo?.sort((a, b) => a.ordine - b.ordine).map((m) => m.modulo_id) || []);
                setSelectedIds(currentIds);
            }
        }
        catch (error) {
            console.error("Errore fetch:", error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => { if (open)
        fetchData(); }, [open]);
    const handleToggle = (id) => () => {
        const currentIndex = selectedIds.indexOf(id);
        const newChecked = [...selectedIds];
        if (currentIndex === -1) {
            newChecked.push(id); // I nuovi aggiunti vanno in coda alla sequenza
        }
        else {
            newChecked.splice(currentIndex, 1);
        }
        setSelectedIds(newChecked);
    };
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSelectedIds((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return (0, sortable_1.arrayMove)(items, oldIndex, newIndex);
            });
        }
    };
    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${config_1.API_BASE_URL}/programmi/${programma.id}/moduli_bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ moduli_ids: selectedIds }),
            });
            if (res.ok) {
                router.refresh();
                handleClose();
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    const filteredModuli = (0, react_1.useMemo)(() => moduli.filter(m => m.titolo.toLowerCase().includes(searchQuery.toLowerCase())), [moduli, searchQuery]);
    const orderedSelectedModuli = (0, react_1.useMemo)(() => selectedIds.map(id => moduli.find(m => m.id === id)).filter(Boolean), [selectedIds, moduli]);
    return (<>
            <material_1.Button variant="contained" size="small" onClick={handleOpen}>Configura Moduli</material_1.Button>
            <material_1.Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <material_1.DialogTitle>Configura Didattica: {programma.titolo}</material_1.DialogTitle>
                <material_1.DialogContent dividers>
                    <Grid_1.default container spacing={4}>
                        {/* Colonna Sinistra: Sequenza Ordinabile */}
                        <Grid_1.default size={{ xs: 12, md: 6 }}>
                            <material_1.Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                                SEQUENZA PROGRAMMA (Trascina per ordinare)
                            </material_1.Typography>
                            <material_1.Box sx={{ minHeight: 350, bgcolor: "grey.50", p: 2, borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                                <core_1.DndContext sensors={sensors} collisionDetection={core_1.closestCenter} onDragEnd={handleDragEnd}>
                                    <sortable_1.SortableContext items={selectedIds} strategy={sortable_1.verticalListSortingStrategy}>
                                        {orderedSelectedModuli.length > 0 ? (orderedSelectedModuli.map((modulo) => (<SortableModuloItem key={modulo.id} modulo={modulo} onRemove={handleToggle(modulo.id)}/>))) : (<material_1.Box sx={{ mt: 10, textAlign: 'center' }}>
                                                <material_1.Typography variant="body2" color="text.secondary">
                                                    Seleziona i moduli dal catalogo<br />per comporre il programma.
                                                </material_1.Typography>
                                            </material_1.Box>)}
                                    </sortable_1.SortableContext>
                                </core_1.DndContext>
                            </material_1.Box>
                        </Grid_1.default>

                        {/* Colonna Destra: Catalogo Selezione */}
                        <Grid_1.default size={{ xs: 12, md: 6 }}>
                            <material_1.Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                                CATALOGO COMPLETO
                            </material_1.Typography>
                            <material_1.TextField fullWidth size="small" placeholder="Cerca modulo..." sx={{ mb: 2 }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                            <material_1.Box sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }}>
                                <Grid_1.default container spacing={0}>
                                    {filteredModuli.map((modulo) => (<Grid_1.default size={12} key={modulo.id}>
                                            <material_1.FormControlLabel sx={{ width: '100%', ml: 0 }} control={<material_1.Checkbox size="small" checked={selectedIds.includes(modulo.id)} onChange={handleToggle(modulo.id)}/>} label={<material_1.Typography variant="body2">{modulo.titolo}</material_1.Typography>}/>
                                        </Grid_1.default>))}
                                </Grid_1.default>
                            </material_1.Box>
                        </Grid_1.default>
                    </Grid_1.default>
                </material_1.DialogContent>
                <material_1.DialogActions>
                    <material_1.Button onClick={handleClose}>Annulla</material_1.Button>
                    <material_1.Button onClick={handleSave} variant="contained" disabled={loading} color="primary">
                        {loading ? <material_1.CircularProgress size={24} color="inherit"/> : "Salva Configurazione"}
                    </material_1.Button>
                </material_1.DialogActions>
            </material_1.Dialog>
        </>);
}
