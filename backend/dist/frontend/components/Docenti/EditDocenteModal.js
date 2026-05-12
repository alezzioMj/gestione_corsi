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
exports.default = EditDocenteModal;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Grid_1 = __importDefault(require("@mui/material/Grid"));
const navigation_1 = require("next/navigation");
const Edit_1 = __importDefault(require("@mui/icons-material/Edit"));
const countries = __importStar(require("i18n-iso-countries"));
const it_json_1 = __importDefault(require("i18n-iso-countries/langs/it.json"));
const config_1 = require("@/lib/config");
// Registra la localizzazione italiana per la libreria delle nazioni
countries.registerLocale(it_json_1.default);
function EditDocenteModal({ open, onClose, docente, onSaveSuccess }) {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const [formData, setFormData] = (0, react_1.useState)({
        nome: "",
        cognome: "",
        codice_fiscale: "",
        datanascita: "",
        nazione: "Italia", // Default Italia
        regione: "",
        provincia: "",
        comune: "",
        sesso: "",
        cellulare: "",
        mail: "",
        cv: "",
        contratto: "",
    });
    (0, react_1.useEffect)(() => {
        if (docente) {
            setFormData({
                nome: docente.nome || "",
                cognome: docente.cognome || "",
                codice_fiscale: docente.codice_fiscale || "",
                datanascita: docente.datanascita ? new Date(docente.datanascita).toISOString().split('T')[0] : "",
                nazione: docente.nazione || "Italia",
                regione: docente.regione || "",
                provincia: docente.provincia || "",
                comune: docente.comune || "",
                sesso: docente.sesso || "",
                cellulare: docente.cellulare || "",
                mail: docente.mail || "",
                cv: docente.cv || "",
                contratto: docente.contratto || "",
            });
        }
        else {
            // Reset form if no docente is provided (e.g., modal closed and reopened for a new one, though this is an edit modal)
            setFormData({ nome: "", cognome: "", codice_fiscale: "", datanascita: "", nazione: "Italia", regione: "", provincia: "", comune: "", sesso: "", cellulare: "", mail: "", cv: "", contratto: "" });
        }
    }, [docente]);
    // Stati per le opzioni geografiche
    const [regioni, setRegioni] = (0, react_1.useState)([]);
    const [province, setProvince] = (0, react_1.useState)([]);
    const [comuni, setComuni] = (0, react_1.useState)([]);
    // Ottieni la lista delle nazioni in italiano dalla libreria
    const countryOptions = Object.entries(countries.getNames("it")).map(([code, name]) => ({
        code,
        name
    }));
    // This useEffect handles initial loading of geographical data when the modal opens
    // or when the docente prop changes.
    (0, react_1.useEffect)(() => {
        if (!open || !docente) {
            // Reset state when modal is closed or no docente is provided
            setRegioni([]);
            setProvince([]);
            setComuni([]);
            return;
        }
        const isItaly = formData.nazione === "Italia" || formData.nazione === "IT";
        const fetchInitialGeoData = async () => {
            if (isItaly) {
                try {
                    const resRegioni = await fetch("https://comuni-ita.nicolorebaioli.dev/regioni");
                    const dataRegioni = await resRegioni.json();
                    setRegioni(dataRegioni);
                    if (formData.regione) {
                        const resProvince = await fetch(`https://comuni-ita.nicolorebaioli.dev/province?regione=${encodeURIComponent(formData.regione)}`);
                        const dataProvince = await resProvince.json();
                        setProvince(dataProvince);
                        if (formData.provincia) {
                            const resComuni = await fetch(`https://comuni-ita.nicolorebaioli.dev/comuni?provincia=${encodeURIComponent(formData.provincia)}`);
                            const dataComuni = await resComuni.json();
                            setComuni(dataComuni);
                        }
                    }
                }
                catch (err) {
                    console.error("Errore caricamento dati geografici iniziali", err);
                }
            }
            else {
                setRegioni([]);
                setProvince([]);
                setComuni([]);
            }
        };
        fetchInitialGeoData();
    }, [open, docente, formData.nazione, formData.regione, formData.provincia]);
    const handleClose = () => {
        onClose();
        // Reset form data is handled by the useEffect when docente becomes null or open becomes false
        setProvince([]);
        setComuni([]);
    };
    const handleRegioneChange = async (newRegione) => {
        setFormData(prev => ({ ...prev, regione: newRegione || "", provincia: "", comune: "" }));
        setProvince([]);
        setComuni([]);
        if (newRegione) {
            try {
                const res = await fetch(`https://comuni-ita.nicolorebaioli.dev/province?regione=${encodeURIComponent(newRegione)}`);
                const data = await res.json();
                setProvince(data);
            }
            catch (err) {
                console.error("Errore caricamento province", err);
            }
        }
    };
    const handleProvinciaChange = async (newProvincia) => {
        setFormData(prev => ({ ...prev, provincia: newProvincia || "", comune: "" }));
        setComuni([]);
        if (newProvincia) {
            try {
                const res = await fetch(`https://comuni-ita.nicolorebaioli.dev/comuni?provincia=${encodeURIComponent(newProvincia)}`);
                const data = await res.json();
                setComuni(data);
            }
            catch (err) {
                console.error("Errore caricamento comuni", err);
            }
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!docente?.codice_fiscale) {
                alert("Errore: Codice fiscale del docente non disponibile per l'aggiornamento.");
                setLoading(false);
                return;
            }
            const res = await fetch(`${config_1.API_BASE_URL}/docenti/${docente.codice_fiscale}`, {
                method: "PUT", // Changed to PUT
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                onSaveSuccess(); // Call the success callback
                onClose(); // Close the modal
            }
            else {
                const errorData = await res.json();
                alert(`Errore: ${errorData.error || "Impossibile aggiornare il docente"}`);
            }
        }
        catch (error) {
            console.error("Errore:", error);
            alert("Errore di rete.");
        }
        finally {
            setLoading(false);
        }
    };
    // Calcolo codice fiscale
    /*const calculateCodiceFiscale = (
        nome: string,
        cognome: string,
        sesso: string,
        luogoDiNascita: string,
        codiceProvincia: string,
        giornoDiNascita: string,
        meseDiNascita: string,
        annoDiNascita: string,
        livelloOmocodia: string,
        comuneSospeso: string,
        access_token: string
    ) => async () => {
        const URL = "http://api.miocodicefiscale.it/calculate?lname={cognome}&fname={nome}&gender={sesso}&city={luogo-di-nascita}&state={codice-provincia}&abolished={comune-soppresso}&day={giorno-di-nascita}&month={mese-di-nascita}&year={anno-di-nascita}&omocodia_level={livello-omocodia}&access_token={tua-chiave-API}";
        try {
            const res = await fetch(URL)
        } catch {

        }
    }*/
    return (<>            
            <material_1.Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <material_1.DialogTitle>Modifica Docente</material_1.DialogTitle>
                    <material_1.DialogContent>
                        <Grid_1.default container spacing={2} sx={{ mt: 1 }}>
                            {/* Dati Anagrafici */}
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Nome" fullWidth required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Cognome" fullWidth required value={formData.cognome} onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}/>
                            </Grid_1.default>
                            <Grid_1.default size={12}>
                                <material_1.TextField label="Codice Fiscale" fullWidth required value={formData.codice_fiscale} onChange={(e) => setFormData({ ...formData, codice_fiscale: e.target.value.toUpperCase() })}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Data di Nascita" type="date" fullWidth required slotProps={{ inputLabel: { shrink: true } }} value={formData.datanascita} onChange={(e) => setFormData({ ...formData, datanascita: e.target.value })}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField select label="Sesso" fullWidth required value={formData.sesso} onChange={(e) => setFormData({ ...formData, sesso: e.target.value })}>
                                    <material_1.MenuItem value="M">Maschio</material_1.MenuItem>
                                    <material_1.MenuItem value="F">Femmina</material_1.MenuItem>
                                    <material_1.MenuItem value="Altro">Altro</material_1.MenuItem>
                                </material_1.TextField>
                            </Grid_1.default>

                            {/* Contatti */}
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Email" type="email" fullWidth required value={formData.mail} onChange={(e) => setFormData({ ...formData, mail: e.target.value })}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Cellulare" fullWidth value={formData.cellulare} onChange={(e) => setFormData({ ...formData, cellulare: e.target.value })}/>
                            </Grid_1.default>

                            {/* Geografia */}
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.Autocomplete options={countryOptions} getOptionLabel={(opt) => opt.name || ""} value={countryOptions.find(c => c.name === formData.nazione) || null} renderInput={(params) => <material_1.TextField {...params} label="Nazione" required/>} isOptionEqualToValue={(option, value) => option.name === value.name} onChange={(_, val) => {
            const newNazione = val?.name || "";
            setFormData({ ...formData, nazione: newNazione, regione: "", provincia: "", comune: "" });
            handleRegioneChange(null); // Clear and reset for new country
        }}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.Autocomplete options={regioni} value={regioni.find(r => r === formData.regione) || null} getOptionLabel={(opt) => opt || ""} isOptionEqualToValue={(option, value) => option === value} renderInput={(params) => <material_1.TextField {...params} label="Regione" required={formData.nazione === "Italia"}/>} disabled={formData.nazione !== "Italia"} onChange={(_, val) => {
            handleRegioneChange(val);
        }}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.Autocomplete options={province} value={province.find(p => p.nome === formData.provincia) || null} getOptionLabel={(opt) => opt.nome || ""} isOptionEqualToValue={(option, value) => option.nome === value.nome} renderInput={(params) => <material_1.TextField {...params} label="Provincia" required={formData.nazione === "Italia"}/>} disabled={!formData.regione || formData.nazione !== "Italia"} onChange={(_, val) => handleProvinciaChange(val?.nome || "")}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.Autocomplete options={comuni} value={comuni.find(c => c.nome === formData.comune) || null} getOptionLabel={(opt) => opt.nome || ""} isOptionEqualToValue={(option, value) => option.nome === value.nome} renderInput={(params) => <material_1.TextField {...params} label="Comune" required={formData.nazione === "Italia"}/>} disabled={!formData.provincia || formData.nazione !== "Italia"} onChange={(_, val) => setFormData({ ...formData, comune: val?.nome || "", })}/>
                            </Grid_1.default>

                            {/* Documentazione e Contratto */}
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Contratto" placeholder="Es: P.IVA, Co.Co.Co" fullWidth value={formData.contratto} onChange={(e) => setFormData({ ...formData, contratto: e.target.value })}/>

                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Link CV" placeholder="URL o riferimento CV" fullWidth value={formData.cv} onChange={(e) => setFormData({ ...formData, cv: e.target.value })}/>
                            </Grid_1.default>
                        </Grid_1.default>
                    </material_1.DialogContent>
                    <material_1.DialogActions>
                        <material_1.Button onClick={handleClose}>Annulla</material_1.Button>
                        <material_1.Button type="submit" variant="contained" startIcon={<Edit_1.default />} disabled={loading}>
                            {loading ? "Salvataggio..." : "Salva Modifiche"}
                        </material_1.Button>
                    </material_1.DialogActions>
                </form>
            </material_1.Dialog>
        </>);
}
