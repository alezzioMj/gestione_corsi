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
exports.default = ManageMaterialiModal;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Delete_1 = __importDefault(require("@mui/icons-material/Delete"));
const Add_1 = __importDefault(require("@mui/icons-material/Add"));
const Attachment_1 = __importDefault(require("@mui/icons-material/Attachment"));
const UploadFile_1 = __importDefault(require("@mui/icons-material/UploadFile")); // New icon for upload
const config_1 = require("@/lib/config");
function ManageMaterialiModal({ modulo }) {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [materialiAssociati, setMaterialiAssociati] = (0, react_1.useState)([]);
    const [selectedFile, setSelectedFile] = (0, react_1.useState)(null);
    const [fileDescription, setFileDescription] = (0, react_1.useState)(""); // State for file description
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Materiali già associati al modulo
            const resAssoc = await fetch(`${config_1.API_BASE_URL}/moduli/${modulo.id}/materiali`);
            if (resAssoc.ok) {
                const data = await resAssoc.json();
                setMaterialiAssociati(data);
            }
            else {
                setMaterialiAssociati([]);
            }
        }
        catch (error) {
            console.error("Errore fetch materiali:", error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        if (open)
            fetchData();
    }, [open]);
    const handleUpload = async () => {
        if (!selectedFile)
            return;
        setLoading(true);
        try {
            // Step 1: Upload the file and create a Materiale entry
            const uploadFormData = new FormData();
            uploadFormData.append("file", selectedFile); // The actual file
            if (fileDescription) {
                uploadFormData.append("descrizione", fileDescription);
            }
            // Assuming a new endpoint for file upload and material creation
            const uploadRes = await fetch(`${config_1.API_BASE_URL}/materiali/upload`, {
                method: "POST",
                body: uploadFormData,
            });
            if (!uploadRes.ok) {
                throw new Error("Errore durante il caricamento del file.");
            }
            const newMateriale = await uploadRes.json(); // Expecting the created Materiale object with an ID
            // Step 2: Associate the newly created Materiale with the current Modulo
            const associateRes = await fetch(`${config_1.API_BASE_URL}/moduli/${modulo.id}/materiali`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ materiale_id: newMateriale.id }),
            });
            if (associateRes.ok) {
                await fetchData();
                setSelectedFile(null);
                setFileDescription("");
            }
        }
        catch (error) {
            console.error("Errore durante l'upload:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRemove = async (materiale_id) => {
        setLoading(true);
        try {
            const res = await fetch(`${config_1.API_BASE_URL}/moduli/${modulo.id}/materiali/${materiale_id}`, {
                method: "DELETE",
            });
            if (res.ok)
                fetchData();
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    return (<>
            <material_1.Button variant="contained" size="small" startIcon={<Attachment_1.default />} onClick={() => setOpen(true)}>
                Materiali
            </material_1.Button>
            <material_1.Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <material_1.DialogTitle>Gestione Materiali: {modulo.titolo}</material_1.DialogTitle>
                <material_1.DialogContent dividers>
                    {/* Lista Materiali Associati in alto */}
                    <material_1.Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        MATERIALI GIÀ ASSOCIATI
                    </material_1.Typography>
                    
                    {loading && materialiAssociati.length === 0 ? (<material_1.Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><material_1.CircularProgress size={24}/></material_1.Box>) : (<material_1.List dense sx={{ mb: 2 }}>
                            {materialiAssociati.length > 0 ? (materialiAssociati.map((ma) => (<material_1.ListItem key={ma.materiale_id} secondaryAction={<material_1.IconButton edge="end" color="error" onClick={() => handleRemove(ma.materiale_id)} disabled={loading}>
                                            <Delete_1.default />
                                        </material_1.IconButton>}>
                                        <material_1.ListItemText primary={ma.materiale?.file_name} secondary={ma.materiale?.descrizione}/>
                                    </material_1.ListItem>))) : (<material_1.Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                    Nessun materiale associato.
                                </material_1.Typography>)}
                        </material_1.List>)}

                    <material_1.Divider sx={{ my: 2 }}/>

                    {/* Form di Upload in basso */}
                    <material_1.Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        CARICA NUOVO MATERIALE
                    </material_1.Typography>
                    <material_1.Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <material_1.Button variant="outlined" component="label" startIcon={<UploadFile_1.default />} size="small" sx={{ flexShrink: 0 }}>
                                Seleziona File
                                <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}/>
                            </material_1.Button>
                            <material_1.Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {selectedFile ? selectedFile.name : "Nessun file selezionato"}
                            </material_1.Typography>
                        </material_1.Box>
                        {selectedFile && (<>
                                <material_1.TextField fullWidth label="Descrizione (opzionale)" size="small" value={fileDescription} onChange={(e) => setFileDescription(e.target.value)}/>
                            </>)}
                        <material_1.Button variant="contained" onClick={handleUpload} disabled={loading || !selectedFile} startIcon={<Add_1.default />}>
                            Carica e Associa
                        </material_1.Button>
                    </material_1.Box>
                </material_1.DialogContent>
                <material_1.DialogActions><material_1.Button onClick={() => setOpen(false)}>Chiudi</material_1.Button></material_1.DialogActions>
            </material_1.Dialog>
        </>);
}
