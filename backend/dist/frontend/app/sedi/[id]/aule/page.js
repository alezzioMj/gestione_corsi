"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuleSedePage;
const material_1 = require("@mui/material");
const link_1 = __importDefault(require("next/link"));
const ArrowBack_1 = __importDefault(require("@mui/icons-material/ArrowBack"));
const react_1 = __importDefault(require("react"));
const AddAulaModal_1 = __importDefault(require("@/components/Aule/AddAulaModal"));
const config_1 = require("@/lib/config");
async function getSede(id) {
    // Questo endpoint include già l'elenco delle aule (sede.aula)
    const res = await fetch(`${config_1.API_BASE_URL}/sedi/${id}`, { cache: "no-store" });
    return res.ok ? res.json() : null;
}
async function AuleSedePage({ params }) {
    const resolvedParams = await params;
    const sedeId = resolvedParams.id;
    if (!sedeId) {
        return (<material_1.Container sx={{ py: 4 }}>
                <material_1.Typography variant="h6" color="error">ID Sede non fornito nell'URL.</material_1.Typography>
                <link_1.default href="/sedi">Torna alla lista delle Sedi</link_1.default>
            </material_1.Container>);
    }
    const sede = await getSede(sedeId);
    if (!sede) {
        return (<material_1.Container sx={{ py: 4 }}>
                <material_1.Typography variant="h6" color="error">Sede con ID "{sedeId}" non trovata.</material_1.Typography>
                <link_1.default href="/sedi">Torna alla lista delle Sedi</link_1.default>
            </material_1.Container>);
    }
    return (<material_1.Container maxWidth="lg" sx={{ py: 4 }}>
            <material_1.Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <link_1.default href="/sedi" style={{ textDecoration: 'none' }}>
                    <material_1.Button variant="outlined" startIcon={<ArrowBack_1.default />}>
                        Torna alle Sedi
                    </material_1.Button>
                </link_1.default>
                <AddAulaModal_1.default sedeId={Number(sedeId)}/>
            </material_1.Box>

            <material_1.Box sx={{ mb: 4 }}>
                <material_1.Typography variant="h4" fontWeight="bold" gutterBottom>
                    Aule - {sede.nome}
                </material_1.Typography>
                <material_1.Typography variant="body1" color="text.secondary">
                    {sede.indirizzo}, {sede.citta} ({sede.provincia})
                </material_1.Typography>
            </material_1.Box>

            <material_1.Paper elevation={2}>
                <material_1.List>
                    {sede.aula && sede.aula.length > 0 ? (sede.aula.map((a, index) => (<react_1.default.Fragment key={a.id}>
                                <material_1.ListItem>
                                    <material_1.ListItemText primary={a.nome} secondary={`Capienza: ${a.capienza ?? 'N/D'} posti`}/>
                                </material_1.ListItem>
                                {index < sede.aula.length - 1 && <material_1.Divider />}
                            </react_1.default.Fragment>))) : (<material_1.ListItem>
                            <material_1.ListItemText primary="Nessuna aula configurata per questa sede."/>
                        </material_1.ListItem>)}
                </material_1.List>
            </material_1.Paper>
        </material_1.Container>);
}
