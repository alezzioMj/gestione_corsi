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
exports.default = AddAulaModal;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Add_1 = __importDefault(require("@mui/icons-material/Add"));
const navigation_1 = require("next/navigation");
function AddAulaModal({ sedeId }) {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const [formData, setFormData] = (0, react_1.useState)({
        nome: "",
        capienza: ""
    });
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({ nome: "", capienza: "" });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/aule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: formData.nome,
                    capienza: Number(formData.capienza),
                    sede_id: sedeId
                }),
            });
            if (res.ok) {
                handleClose();
                router.refresh(); // Ricarica i dati della pagina (Server Component)
            }
            else {
                alert("Errore durante la creazione dell'aula");
            }
        }
        catch (error) {
            console.error("Errore:", error);
        }
        finally {
            setLoading(false);
        }
    };
    return (<>
            <material_1.Button variant="contained" startIcon={<Add_1.default />} onClick={handleOpen}>
                Aggiungi Aula
            </material_1.Button>

            <material_1.Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
                <form onSubmit={handleSubmit}>
                    <material_1.DialogTitle>Nuova Aula</material_1.DialogTitle>
                    <material_1.DialogContent>
                        <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <material_1.TextField label="Nome Aula" fullWidth required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })}/>
                            <material_1.TextField label="Capienza" type="number" fullWidth value={formData.capienza} onChange={(e) => setFormData({ ...formData, capienza: e.target.value })}/>
                        </material_1.Box>
                    </material_1.DialogContent>
                    <material_1.DialogActions>
                        <material_1.Button onClick={handleClose}>Annulla</material_1.Button>
                        <material_1.Button type="submit" variant="contained" disabled={loading}>
                            {loading ? "Salvataggio..." : "Salva"}
                        </material_1.Button>
                    </material_1.DialogActions>
                </form>
            </material_1.Dialog>
        </>);
}
