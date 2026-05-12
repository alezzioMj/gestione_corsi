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
exports.default = AddSedeModal;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Add_1 = __importDefault(require("@mui/icons-material/Add"));
const navigation_1 = require("next/navigation");
const config_1 = require("@/lib/config");
function AddSedeModal() {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const [formData, setFormData] = (0, react_1.useState)({
        nome: "",
        indirizzo: "",
        civico: "",
        cap: "",
        citta: "",
        provincia: "",
        descrizione: ""
    });
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({
            nome: "",
            indirizzo: "",
            civico: "",
            cap: "",
            citta: "",
            provincia: "",
            descrizione: ""
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${config_1.API_BASE_URL}/sedi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                handleClose();
                router.refresh(); // Ricarica i dati della pagina (Server Component)
            }
            else {
                const errorData = await res.json();
                alert(`Errore durante la creazione della sede: ${errorData.error || res.statusText}`);
            }
        }
        catch (error) {
            console.error("Errore:", error);
            alert("Si è verificato un errore di rete.");
        }
        finally {
            setLoading(false);
        }
    };
    return (<>
            <material_1.Button variant="contained" startIcon={<Add_1.default />} onClick={handleOpen}>
                Crea Nuova Sede
            </material_1.Button>

            <material_1.Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit}>
                    <material_1.DialogTitle>Crea Nuova Sede</material_1.DialogTitle>
                    <material_1.DialogContent>
                        <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <material_1.TextField label="Nome Sede" fullWidth required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })}/>
                            <material_1.TextField label="Indirizzo" fullWidth required value={formData.indirizzo} onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}/>
                            <material_1.TextField label="Civico" fullWidth value={formData.civico} onChange={(e) => setFormData({ ...formData, civico: e.target.value })}/>
                            <material_1.TextField label="CAP" fullWidth required value={formData.cap} onChange={(e) => setFormData({ ...formData, cap: e.target.value })}/>
                            <material_1.TextField label="Città" fullWidth required value={formData.citta} onChange={(e) => setFormData({ ...formData, citta: e.target.value })}/>
                            <material_1.TextField label="Provincia" fullWidth required value={formData.provincia} onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}/>
                            <material_1.TextField label="Descrizione" fullWidth multiline rows={3} value={formData.descrizione} onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}/>
                        </material_1.Box>
                    </material_1.DialogContent>
                    <material_1.DialogActions>
                        <material_1.Button onClick={handleClose}>Annulla</material_1.Button>
                        <material_1.Button type="submit" variant="contained" disabled={loading}>
                            {loading ? "Creazione..." : "Crea"}
                        </material_1.Button>
                    </material_1.DialogActions>
                </form>
            </material_1.Dialog>
        </>);
}
