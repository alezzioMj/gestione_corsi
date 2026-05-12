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
exports.default = EditModuloModal;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Edit_1 = __importDefault(require("@mui/icons-material/Edit"));
const config_1 = require("@/lib/config");
function EditModuloModal({ open, onClose, modulo, onSaveSuccess }) {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [formData, setFormData] = (0, react_1.useState)({
        nome: "",
        descrizione: "",
        ore: 0
    });
    (0, react_1.useEffect)(() => {
        if (modulo) {
            setFormData({
                nome: modulo.nome || "",
                descrizione: modulo.descrizione || "",
                ore: modulo.ore || 0
            });
        }
    }, [modulo, open]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${config_1.API_BASE_URL}/moduli/${modulo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                onSaveSuccess();
                onClose();
            }
            else {
                alert("Errore durante l'aggiornamento del modulo");
            }
        }
        catch (err) {
            alert("Errore di rete");
        }
        finally {
            setLoading(false);
        }
    };
    return (<material_1.Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <form onSubmit={handleSubmit}>
                <material_1.DialogTitle>Modifica Modulo</material_1.DialogTitle>
                <material_1.DialogContent dividers>
                    <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <material_1.TextField label="Nome Modulo" fullWidth required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })}/>
                        <material_1.TextField label="Ore" type="number" fullWidth required value={formData.ore} onChange={(e) => setFormData({ ...formData, ore: Number(e.target.value) })}/>
                        <material_1.TextField label="Descrizione" fullWidth multiline rows={4} value={formData.descrizione} onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}/>
                    </material_1.Box>
                </material_1.DialogContent>
                <material_1.DialogActions>
                    <material_1.Button onClick={onClose}>Annulla</material_1.Button>
                    <material_1.Button type="submit" variant="contained" startIcon={<Edit_1.default />} disabled={loading}>
                        {loading ? "Salvataggio..." : "Salva Modifiche"}
                    </material_1.Button>
                </material_1.DialogActions>
            </form>
        </material_1.Dialog>);
}
